-- Add policy to allow users to cancel their own pending orders
CREATE POLICY "Users can cancel their own pending orders" 
ON public.orders 
FOR UPDATE 
USING (
  (auth.uid())::text = (user_id)::text 
  AND status = 'pending'
)
WITH CHECK (
  (auth.uid())::text = (user_id)::text 
  AND status = 'cancelled'
);