import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wpmfnhzvumwfqscqozss.supabase.co';
const supabaseAnonKey = 'sb_publishable_JjmwbHdXnV1SdaXG6l9kwQ_1yf9jlTW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
