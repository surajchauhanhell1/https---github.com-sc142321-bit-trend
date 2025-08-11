// Supabase Edge Function: update-order-status
// Bypasses RLS with service role after validating permissions.
// Permissions:
// - Admins (user_roles.role = 'admin') can update any order to any status
// - Non-admin users can set status to 'cancelled' on their own orders
//   when current status is 'pending' or 'processing'

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

serve(async (req) => {
  try {
    const { orderId, newStatus } = await req.json();
    if (!orderId || !newStatus) {
      return new Response(JSON.stringify({ error: 'MISSING_PARAMS' }), { status: 400 });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Get caller user using anon client with forwarded auth header
    const anon = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    });
    const { data: userRes, error: userErr } = await anon.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: 'UNAUTHENTICATED' }), { status: 401 });
    }

    const userId = userRes.user.id;

    // Use service client to read/modify regardless of RLS
    const admin = createClient(supabaseUrl, serviceKey);

    // Check admin
    const { data: role, error: roleErr } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!role && !roleErr;

    // Fetch order
    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, user_id, status')
      .eq('id', orderId)
      .single();
    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'ORDER_NOT_FOUND' }), { status: 404 });
    }

    // Permission checks
    if (!isAdmin) {
      const allowed =
        newStatus === 'cancelled' &&
        order.user_id === userId &&
        (order.status === 'pending' || order.status === 'processing');
      if (!allowed) {
        return new Response(JSON.stringify({ error: 'FORBIDDEN' }), { status: 403 });
      }
    }

    const { error: updErr } = await admin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (updErr) {
      return new Response(JSON.stringify({ error: 'UPDATE_FAILED', details: updErr.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', details: String(e) }), { status: 500 });
  }
});


