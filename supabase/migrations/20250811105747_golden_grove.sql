@@ .. @@
 CREATE POLICY "Users can cancel their own orders (pending or processing)"
 ON public.orders
 FOR UPDATE
 USING (
   (auth.uid())::text = (user_id)::text
-  AND status IN ('pending', 'processing')
+  AND (status = 'pending' OR status = 'processing')
 )
 WITH CHECK (
   (auth.uid())::text = (user_id)::text
   AND status = 'cancelled'
 );