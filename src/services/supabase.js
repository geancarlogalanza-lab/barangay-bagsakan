import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://numrunpdjtytjybipzog.supabase.co'
const supabaseAnonKey = 'sb_publishable_FFGORcNYSF8TgBzK7DE9vA_f3AfBTTb'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)