# Supabase setup

1. Create a dedicated Supabase project for development/audit.
2. Run `schema.sql` in the SQL Editor.
3. Create a test user in Authentication. The database trigger creates a profile with the `employee` role.
4. To create an administrator, use a trusted operator-only workflow and verify the identity first. Do not expose role changes through a client-side form.
5. Keep production and audit projects separate.

The SQL schema deliberately does not create a default account or password. Do not put credentials in source control.
