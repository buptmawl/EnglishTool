import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

// Use service role key in backend to bypass RLS when necessary, or just anon key based on needs
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
