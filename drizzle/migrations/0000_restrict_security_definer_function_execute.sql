-- Lock down SECURITY DEFINER functions
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
-- authenticated must keep EXECUTE: has_role is referenced by RLS policies evaluated as the authenticated role
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
