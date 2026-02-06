import { createClient } from '@supabase/supabase-js';
import { neon } from '@netlify/neon';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read .env
function getEnvVar(key) {
    if (process.env[key]) return process.env[key];
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf-8');
            const match = envFile.match(new RegExp(`^${key}=(.*)$`, 'm'));
            if (match) {
                // Remove quotes if present
                return match[1].replace(/^["'](.*)["']$/, '$1');
            }
        }
    } catch (e) {
        // ignore
    }
    return null;
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.NETLIFY_DATABASE_URL;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('\x1b[31mError: VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.\x1b[0m');
    console.error('Please ensure .env has VITE_SUPABASE_URL and run the script with SUPABASE_SERVICE_ROLE_KEY:');
    console.error('\n    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key node scripts/create_admin.js\n');
    process.exit(1);
}

if (!databaseUrl) {
    console.error('\x1b[31mError: NETLIFY_DATABASE_URL is missing.\x1b[0m');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const sql = neon(databaseUrl);

async function createAdmin() {
    const email = 'amar@admin.com';
    const password = 'Aa123456';

    console.log(`\nProcessing user: ${email}...`);

    // 1. Create User or Get Existing in Supabase Auth
    let userId;
    
    console.log('Attempting to create user in Supabase Auth...');
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
    });

    if (userError) {
        console.log(`Supabase Auth note: ${userError.message}`);
        // If user already exists, find their ID
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('\x1b[31mError listing users:\x1b[0m', listError.message);
            process.exit(1);
        }
        
        const existingUser = listData.users.find(u => u.email === email);
        if (existingUser) {
            userId = existingUser.id;
            console.log(`Found existing Supabase user ID: ${userId}`);
        } else {
            console.error('\x1b[31mCould not create or find user in Supabase.\x1b[0m');
            process.exit(1);
        }
    } else {
        userId = userData.user.id;
        console.log(`User created in Supabase with ID: ${userId}`);
    }

    // 2. Sync to Neon 'users' table
    console.log(`Syncing user ${userId} to Neon 'users' table...`);
    try {
        await sql`
            INSERT INTO users (id, email, full_name)
            VALUES (${userId}, ${email}, 'Admin User')
            ON CONFLICT (id) DO UPDATE 
            SET email = ${email}
        `;
        console.log('User synced to Neon.');
    } catch (err) {
        console.error('Error syncing user to Neon:', err.message);
        // Continue anyway
    }

    // 3. Assign Role in Neon
    console.log(`Assigning 'admin' role to user ${userId} in Neon...`);

    try {
        await sql`
            INSERT INTO user_roles (user_id, role)
            VALUES (${userId}, 'admin')
            ON CONFLICT (user_id, role) DO NOTHING
        `;
        console.log('\x1b[32mSuccess! User assigned admin role in Neon.\x1b[0m');
    } catch (err) {
        console.error('\x1b[31mError assigning role in Neon:\x1b[0m', err.message);
        process.exit(1);
    }
}

createAdmin();
