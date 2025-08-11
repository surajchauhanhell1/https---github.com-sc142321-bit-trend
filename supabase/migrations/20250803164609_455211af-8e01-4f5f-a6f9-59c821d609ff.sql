-- Replace with correct USING/WITH CHECK form
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;
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