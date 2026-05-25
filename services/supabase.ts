import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = init?.method || 'GET';
  const url = input.toString();
  const endpoint = url.split('/').pop()?.split('?')[0] || 'Endpoint';
  
    try {
      console.groupCollapsed(`%c ⚡ Supabase Req: ${method} ${endpoint} `, "background: #0ea5e9; color: white; padding: 2px 5px; border-radius: 2px;");
      console.log("URL:", url);

      // Redact sensitive headers before logging
      try {
        const headersObj: Record<string, any> = {};
        if (init?.headers instanceof Headers) {
          init.headers.forEach((v, k) => {
            headersObj[k] = /authorization|apikey|anon|token|key/i.test(k) ? 'REDACTED' : v;
          });
        } else if (init?.headers && typeof init.headers === 'object') {
          for (const [k, v] of Object.entries(init.headers as any)) {
            headersObj[k] = /authorization|apikey|anon|token|key/i.test(k) ? 'REDACTED' : v;
          }
        }
        if (Object.keys(headersObj).length) console.log("Headers:", headersObj);
      } catch {}

      if (init?.body) {
        try {
          const parsedBody = JSON.parse(init.body as string);
          const redactKeys = (obj: any) => {
            if (!obj || typeof obj !== 'object') return obj;
            const out: any = Array.isArray(obj) ? [] : {};
            for (const [k, v] of Object.entries(obj)) {
              if (/password|apiKey|apikey|key|token|access_token|refresh_token|service_role/i.test(k)) {
                out[k] = 'REDACTED';
              } else if (typeof v === 'object') {
                out[k] = redactKeys(v);
              } else {
                out[k] = v;
              }
            }
            return out;
          };
          console.log('Body:', redactKeys(parsedBody));
        } catch {
          // Non-JSON body — avoid logging raw binary or large payloads
          console.log('Body: [non-json or binary]');
        }
      }

      console.groupEnd();
    } catch (e) {
      // Logging failed, continue with fetch
    }

  try {
    const response = await fetch(input, init);
    
    // Attempt to log response safely
    try {
      const clone = response.clone();
      let body;
      const contentType = clone.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
          try {
              body = await clone.json();
          } catch {
              body = await clone.text();
          }
      } else {
          body = await clone.text();
      }

      const isError = !response.ok;
      const colorStyle = isError 
        ? "background: #ef4444; color: white; padding: 2px 5px; border-radius: 2px;" 
        : "background: #22c55e; color: white; padding: 2px 5px; border-radius: 2px;";

      console.groupCollapsed(`%c 📥 Supabase Res: ${response.status} ${endpoint} `, colorStyle);
      console.log("URL:", url);
      console.log('Body:', body);
      console.groupEnd();
    } catch (logErr) {
      // Logging response failed
    }

    return response;
  } catch (error) {
    console.groupCollapsed(`%c 🔥 Supabase Net Error: ${endpoint} `, "background: #ef4444; color: white; padding: 2px 5px; border-radius: 2px;");
    console.error(error);
    console.groupEnd();
    throw error;
  }
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: {
    fetch: customFetch,
  },
});