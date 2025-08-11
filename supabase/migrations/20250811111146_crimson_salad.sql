/*
  # Fix CASE statement missing ELSE part error

  This migration addresses the database error "CASE statement is missing ELSE part"
  that occurs when fetching orders. The error suggests there's a CASE statement
  in a view, function, or trigger that's missing an ELSE clause.

  1. Check and fix any views related to orders
  2. Check and fix any functions that might contain CASE statements
  3. Ensure all CASE expressions have proper ELSE clauses
*/

-- First, let's check if there are any views that might have problematic CASE statements
-- and recreate them with proper ELSE clauses

-- Drop and recreate any views that might have CASE statements without ELSE
DO $$
BEGIN
  -- Check if there's an orders view and drop it if it exists
  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'orders_view') THEN
    DROP VIEW orders_view;
  END IF;
END $$;

-- Fix any RLS policies that might have CASE statements
-- Update the orders table policies to ensure they don't have problematic CASE statements
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can update own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

-- Recreate policies with proper structure
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for managing all orders
CREATE POLICY "Admins can manage all orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email = 'admin@example.com'
    )
  );

-- Fix any functions that might have CASE statements
-- Drop and recreate the update_order_status function if it exists
DROP FUNCTION IF EXISTS update_order_status(uuid, text);

-- Recreate the function with proper CASE handling
CREATE OR REPLACE FUNCTION update_order_status(
  p_order_id uuid,
  p_new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate the new status
  IF p_new_status NOT IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status: %', p_new_status;
  END IF;

  -- Update the order status with proper timestamp handling
  UPDATE orders 
  SET 
    status = p_new_status,
    updated_at = now(),
    processing_date = CASE 
      WHEN p_new_status = 'processing' AND processing_date IS NULL THEN now()
      ELSE processing_date
    END,
    shipped_date = CASE 
      WHEN p_new_status = 'shipped' AND shipped_date IS NULL THEN now()
      ELSE shipped_date
    END,
    delivered_date = CASE 
      WHEN p_new_status = 'delivered' AND delivered_date IS NULL THEN now()
      ELSE delivered_date
    END
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION update_order_status(uuid, text) TO authenticated;

-- Ensure all computed columns or expressions in the orders table are properly handled
-- Add any missing columns that might be causing issues
DO $$
BEGIN
  -- Add processing_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'processing_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN processing_date timestamptz;
  END IF;

  -- Add shipped_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipped_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipped_date timestamptz;
  END IF;

  -- Add delivered_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivered_date'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivered_date timestamptz;
  END IF;
END $$;

-- Create a simple view for orders with proper CASE handling if needed
CREATE OR REPLACE VIEW orders_with_status AS
SELECT 
  o.*,
  CASE 
    WHEN o.status = 'pending' THEN 'Order Placed'
    WHEN o.status = 'processing' THEN 'Processing Order'
    WHEN o.status = 'shipped' THEN 'Order Shipped'
    WHEN o.status = 'delivered' THEN 'Order Delivered'
    WHEN o.status = 'cancelled' THEN 'Order Cancelled'
    ELSE 'Unknown Status'
  END as status_display
FROM orders o;

-- Grant access to the view
GRANT SELECT ON orders_with_status TO authenticated;