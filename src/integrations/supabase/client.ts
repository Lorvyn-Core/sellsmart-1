import * as Supabase from '@supabase/supabase-js'

const supabaseUrl = 'https://vumzbvmnrupwislslsgk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1bXpidm1ucnVwd2lzbHNsc2drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI2NzUyNDUsImV4cCI6MjA5ODI1MTI0NX0.nLulCkUT3mgP4iNCHldjIcTinSklvxUXtlcP70UDFQU';

export const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey)
