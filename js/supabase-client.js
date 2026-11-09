/* ============================================================
   SUPABASE-CLIENT.JS — Creates the Supabase client
   Depends on:
     1. @supabase/supabase-js loaded via CDN <script> tag
        (must appear BEFORE this script tag in HTML)
     2. supabase-config.js loaded before this file
   ============================================================ */

// Guard 1: only create client if REAL credentials are configured
const _credentialsConfigured =
  typeof SUPABASE_URL      === 'string' &&
  SUPABASE_URL.startsWith('https://') &&
  typeof SUPABASE_ANON_KEY === 'string' &&
  SUPABASE_ANON_KEY.startsWith('eyJ');

// Guard 2: only create client if the CDN library actually loaded
const _sdkLoaded = typeof window !== 'undefined' &&
                   typeof window.supabase !== 'undefined' &&
                   typeof window.supabase.createClient === 'function';

const _supabaseClient = (_credentialsConfigured && _sdkLoaded)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

if (!_credentialsConfigured) {
  console.info('SABI: Supabase credentials not configured — running in local mode.');
} else if (!_sdkLoaded) {
  console.warn('SABI: Supabase SDK not loaded — check CDN script tag.');
}
