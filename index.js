// आपकी APInex API Key यहाँ सुरक्षित सेट है
const APINEX_API_KEY = "sk-apxc23e1858ec4ca2b036573c7eb1df810"; 

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

    // होम स्टेटस चेक
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(JSON.stringify({ status: "online", system: "Aryan News Tech Proxy" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    try {
      const targetUrl = 'https://api.apinex.bond' + url.pathname + url.search;

      // हेडर क्लीनिंग और ऑथेंटिकेशन
      const cleanHeaders = new Headers();
      cleanHeaders.set('Content-Type', 'application/json');
      // आपकी API Key वर्कर खुद जोड़ेगा (वेबसाइट पर डालने की ज़रूरत नहीं)
      cleanHeaders.set('Authorization', `Bearer ${APINEX_API_KEY}`);

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
