-- Allow users to cancel their own orders when status is pending OR processing
-- Clean up any previous cancel policies
DROP POLICY IF EXISTS "Users can cancel their own pending orders" ON public.orders;
DROP POLICY IF EXISTS "Users can cancel their own orders (pending or processing)" ON public.orders;

CREATE POLICY "Users can cancel their own orders (pending or processing)"
ON public.orders
FOR UPDATE
USING (
  (auth.uid())::text = (user_id)::text
  AND status IN ('pending', 'processing')
)
WITH CHECK (
  (auth.uid())::text = (user_id)::text
  AND status = 'cancelled'
);


