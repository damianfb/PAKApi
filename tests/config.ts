// Test configuration for PAKApi E2E tests
// Handles environment setup and Supabase client configuration

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export interface TestConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  supabaseAnonKey: string;
}

// Load configuration from environment variables
export function loadTestConfig(): TestConfig {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing required environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY'
    );
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    supabaseAnonKey: supabaseAnonKey || supabaseServiceKey,
  };
}

// Create Supabase client for tests (uses service role key for full access)
export function createTestClient(): SupabaseClient {
  const config = loadTestConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Create Supabase client for authenticated user tests (uses anon key)
export function createAnonClient(): SupabaseClient {
  const config = loadTestConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Base URL for Edge Functions
export function getEdgeFunctionUrl(functionName: string): string {
  const config = loadTestConfig();
  return `${config.supabaseUrl}/functions/v1/${functionName}`;
}

// Make HTTP request to Edge Function
export async function callEdgeFunction(
  functionName: string,
  options: {
    method?: string;
    path?: string;
    body?: unknown;
    useServiceKey?: boolean;
  } = {}
): Promise<Response> {
  const config = loadTestConfig();
  const method = options.method || 'GET';
  const path = options.path || '';
  const useServiceKey = options.useServiceKey !== false; // Default to true
  const url = `${config.supabaseUrl}/functions/v1/${functionName}${path}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${useServiceKey ? config.supabaseServiceKey : config.supabaseAnonKey}`,
  };

  const fetchOptions: RequestInit = {
    method,
    headers,
  };

  if (options.body && (method === 'POST' || method === 'PUT')) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  return await fetch(url, fetchOptions);
}
