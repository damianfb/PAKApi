import { corsHeaders } from './cors.ts';

export function successResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return new Response(
    JSON.stringify({
      error: message,
      details: details || undefined,
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}
