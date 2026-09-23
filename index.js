export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // यह सीधे आपके Cloudflare Secret (APINEX_API_KEY) से Key उठाएगा
    const apiKey = env.APINEX_API_KEY;

    try {
      const targetUrl = 'https://api.apinex.bond' + url.pathname + url.search;

      const cleanHeaders = new Headers();
      cleanHeaders.set('Content-Type', 'application/json');
      if (apiKey) {
        cleanHeaders.set('Authorization', `Bearer ${apiKey.trim()}`);
      }

      const fetchOptions = {
        method: request.method,
        headers: cleanHeaders,
      };

      if (request.method === 'POST') {
        fetchOptions.body = request.body;
      }

      const response = await fetch(targetUrl, fetchOptions);

      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

      Object.keys(corsHeaders).forEach(k => newResponse.headers.set(k, corsHeaders[k]));
      return newResponse;

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
