-- SQL Script to make 'amar@admin.com' an admin
-- Run this in your Supabase SQL Editor

-- 1. Ensure the user exists. 
-- Note: Creating a user with a specific password via SQL is complex due to hashing. 
-- It is recommended to create the user via the Authentication dashboard if they don't exist.
-- User: amar@admin.com
-- Pass: Aa123456

-- 2. Assign the 'admin' role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'amar@admin.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verify the result
SELECT * FROM public.user_roles 
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'amar@admin.com');
