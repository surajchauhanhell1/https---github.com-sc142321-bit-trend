/*
  # Fix Order Cancellation Functionality

  This migration ensures that order cancellation works properly for both admins and users.
  
  1. Updates the update_order_status function to handle cancellations properly
  2. Ensures proper RLS policies for order updates
  3. Adds proper error handling and logging
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.update_order_status(uuid, text);

-- Create improved update_order_status function
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id uuid,
  p_new_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_order_user_id uuid;
  v_current_status text;
  v_rows_affected integer;
BEGIN
  -- Check if user is authenticated
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user is admin
  SELECT public.has_role(v_user_id, 'admin'::public.app_role) INTO v_is_admin;

  -- Get order details
  SELECT user_id, status INTO v_order_user_id, v_current_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Permission checks
  IF v_is_admin THEN
    -- Admins can update any order to any status
    UPDATE public.orders 
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
    
    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    IF v_rows_affected = 0 THEN
      RAISE EXCEPTION 'Failed to update order';
    END IF;
    
    RETURN true;
  ELSE
    -- Non-admin users can only cancel their own orders when pending or processing
    IF v_order_user_id = v_user_id AND p_new_status = 'cancelled' AND v_current_status IN ('pending', 'processing') THEN
      UPDATE public.orders 
      SET 
        status = 'cancelled',
        updated_at = now()
      WHERE id = p_order_id 
        AND user_id = v_user_id 
        AND status IN ('pending', 'processing');
      
      GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
      
      IF v_rows_affected = 0 THEN
        RAISE EXCEPTION 'Cannot cancel order - order may have already been processed';
      END IF;
      
      RETURN true;
    ELSE
      RAISE EXCEPTION 'Permission denied - you can only cancel your own pending or processing orders';
    END IF;
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.update_order_status(uuid, text) TO authenticated;

-- Ensure all required columns exist with proper defaults
DO $$
BEGIN
  -- Add processing_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'processing_date'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN processing_date TIMESTAMPTZ;
  END IF;

  -- Add shipped_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'shipped_date'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN shipped_date TIMESTAMPTZ;
  END IF;

  -- Add delivered_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'delivered_date'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN delivered_date TIMESTAMPTZ;
  END IF;
END $$;

-- Update RLS policies to ensure proper cancellation permissions
DROP POLICY IF EXISTS "Users can cancel their own orders (pending or processing)" ON public.orders;

CREATE POLICY "Users can cancel their own orders (pending or processing)"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND status IN ('pending', 'processing')
)
WITH CHECK (
  auth.uid() = user_id
  AND status = 'cancelled'
);

-- Ensure admins can update any order
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Admins can update all orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));