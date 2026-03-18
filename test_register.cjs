const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const SUPABASE_URL = 'https://eilpafndxtzsmxozrpnm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpbHBhZm5keHR6c214b3pycG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyOTcwMzUsImV4cCI6MjA4MDg3MzAzNX0.yFiNZ1W9YmrJbMx-2_YPdgfgZ2qYWUMk4xjPLDlN9hk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testRegister() {
    console.log("Creating user without role...");
    const fakeEmail = `test_${Date.now()}@test.com`;
    const { data: userData, error: userError } = await supabase
        .from('b2b_users')
        .insert([{ email: fakeEmail, password_hash: '123' }])
        .select()
        .single();
        
    if (userError) {
         console.error("USER ERROR:", userError);
         return;
    }
    console.log("User created:", userData);
}

testRegister();
