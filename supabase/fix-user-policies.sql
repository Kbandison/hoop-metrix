-- Fix user creation issues by adding missing RLS policies

-- Allow users to insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow service role to manage user profiles (for admin operations)
CREATE POLICY "Service role can manage user profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Allow admins to view all user profiles
CREATE POLICY "Admins can view all user profiles" ON user_profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

-- Allow admins to manage user profiles
CREATE POLICY "Admins can manage user profiles" ON user_profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

-- Allow admins to manage admin_users table
CREATE POLICY "Admins can view admin users" ON admin_users
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can manage admin users" ON admin_users
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM admin_users WHERE role = 'admin'
        )
    );

-- Allow service role to manage admin_users (needed for creating first admin)
CREATE POLICY "Service role can manage admin users" ON admin_users
    FOR ALL USING (auth.role() = 'service_role');