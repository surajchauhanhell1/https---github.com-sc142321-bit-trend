-- Grant admin role to the specified email if profile exists
-- This ensures the account can access the Admin Dashboard immediately

-- Insert admin role for the specific user email (idempotent)
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, 'admin'::app_role
FROM public.profiles p
WHERE p.email = 'surajchauhan76604@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
