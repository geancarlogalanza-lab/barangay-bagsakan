-- SECURITY DEFINER functions in the public schema are callable through the API
-- (/rest/v1/rpc/...) unless EXECUTE is revoked (Supabase advisors 0028/0029).
-- Trigger functions run without the caller needing EXECUTE, so nobody needs it.
revoke execute on function public.donations_before_write() from public, anon, authenticated;
revoke execute on function public.donations_log_status() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- is_admin() is evaluated inside the RLS policies as the signed-in user, so
-- authenticated keeps EXECUTE (it only reveals the caller's own role).
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
