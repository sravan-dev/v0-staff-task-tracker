-- This script is no longer needed as we now create the admin user through the application
-- The setup page at /setup will handle creating the default admin user properly

-- Just ensure the staff_profiles table is ready for the admin user
-- The application will handle user creation through Supabase's proper API

SELECT 'Setup page available at /setup to create default admin user' as message;
