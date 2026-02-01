import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export function createSupabaseClient(req: Request) {
  // Get the authorization header from the request
  const authHeader = req.headers.get('Authorization');
  // Get the apikey header from the request
  const apikeyHeader = req.headers.get('apikey');
  
  // Use the apikey from the request if provided, otherwise use the service role key
  const supabaseKey = apikeyHeader ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    supabaseKey,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  );
}
