import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ojjcgmitujbelbbiyxbc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qamNnbWl0dWpiZWxiYml5eGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3ODE1MjgsImV4cCI6MjA5MTM1NzUyOH0.w2SspELlygq55FeZq9Q6I-fcwVfsRXBPVWJiHcKGvJ8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
