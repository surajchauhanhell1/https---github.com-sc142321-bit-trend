-- Secure order status update that works for both admin and user cancellation
-- Uses SECURITY DEFINER to run with elevated privileges while enforcing logic internally

create or replace function public.update_order_status(
  p_order_id uuid,
  p_new_status text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_admin boolean := false;
  v_owner uuid;
  v_current_status text;
begin
  -- Determine if caller is admin
  select public.has_role(v_user_id, 'admin'::public.app_role) into v_is_admin;

  -- Get current order data
  select user_id, status into v_owner, v_current_status
  from public.orders
  where id = p_order_id;

  if not found then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  -- Admins can set any status
  if v_is_admin then
    update public.orders set status = p_new_status where id = p_order_id;
    return true;
  end if;

  -- Non-admin: only owner can cancel when pending or processing
  if v_owner::text = v_user_id::text then
    if p_new_status = 'cancelled' and v_current_status in ('pending','processing') then
      update public.orders
      set status = 'cancelled'
      where id = p_order_id and status in ('pending','processing');
      return true;
    else
      raise exception 'NOT_ALLOWED_FOR_USER';
    end if;
  end if;

  raise exception 'FORBIDDEN';
end;
$$;

revoke all on function public.update_order_status(uuid, text) from public;
grant execute on function public.update_order_status(uuid, text) to anon, authenticated;


