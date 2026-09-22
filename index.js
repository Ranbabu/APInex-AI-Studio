export default {
  async fetch(request, env, ctx) {
    // CORS हेडर - यह गिटहब पेजेस या किसी भी साइट से रिक्वेस्ट की अनुमति देगा
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // प्री-फ्लाइट रिक्वेस्ट हैंडलिंग
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      // APInex के असली URL पर रिक्वेस्ट रूट करना
      const targetUrl = 'https://api.apinex.bond' + url.pathname + url.search;

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      const response = await fetch(proxyRequest);
      const newResponse = new Response(response.body, response);
      
      // वापस जाते समय CORS हेडर जोड़ना
      Object.keys(corsHeaders).forEach(key => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      return newResponse;
      
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
