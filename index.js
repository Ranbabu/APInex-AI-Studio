export default {
  async fetch(request, env, ctx) {
    // CORS हेडर जो ब्राउज़र को ब्लॉक करने से रोकेंगे
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // 1. ब्राउज़र की प्री-फ्लाइट (OPTIONS) रिक्वेस्ट को हैंडल करना
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const url = new URL(request.url);
      
      // 2. APInex के असली URL पर रिक्वेस्ट भेजना
      const targetUrl = 'https://api.apinex.bond' + url.pathname + url.search;

      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      // 3. APInex से डेटा मंगाना
      const response = await fetch(proxyRequest);

      // 4. वापस आते समय डेटा में CORS हेडर जोड़ना ताकि GitHub Pages उसे पढ़ सके
      const newResponse = new Response(response.body, response);
      Object.keys(corsHeaders).forEach(key => {
        newResponse.headers.set(key, corsHeaders[key]);
      });

      return newResponse;
      
    } catch (e) {
      // अगर कोई एरर आए तो उसे सही फॉर्मेट में भेजना
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
