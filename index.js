export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // Pre-flight handling
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // अगर कोई सीधा Worker URL खोले तो 404 के बजाय स्टेटस दिखेगा
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({ 
        status: "active", 
        message: "APInex Proxy Worker is running successfully!" 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const targetUrl = 'https://api.apinex.bond' + url.pathname + url.search;

      // 400 Bad Request से बचने के लिए केवल वैध हेडर पास करें (Host हेडर हटाएं)
      const cleanHeaders = new Headers();
      for (const [key, value] of request.headers.entries()) {
        const lowerKey = key.toLowerCase();
        if (!['host', 'content-length', 'cf-ray', 'cf-connecting-ip', 'cf-visitor', 'x-real-ip'].includes(lowerKey)) {
          cleanHeaders.set(key, value);
        }
      }

      const fetchOptions = {
        method: request.method,
        headers: cleanHeaders,
        redirect: 'follow'
      };

      // केवल POST/PUT रिक्वेस्ट में body भेजें
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        fetchOptions.body = request.body;
      }

      const response = await fetch(targetUrl, fetchOptions);

      // रिस्पांस तैयार करें और CORS हेडर जोड़ें
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      });

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
