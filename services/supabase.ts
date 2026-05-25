import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fxffjfjivwbunkgubpia.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZmZqZmppdndidW5rZ3VicGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTI3OTksImV4cCI6MjA4MTAyODc5OX0.jln7HkfJfXvh2Qd40l1hJBkJ3ujjWv_0XpOXC8KmNi8';

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const method = init?.method || 'GET';
  const url = input.toString();
  const endpoint = url.split('/').pop()?.split('?')[0] || 'Endpoint';
  
  try {
    console.groupCollapsed(`%c ⚡ Supabase Req: ${method} ${endpoint} `, "background: #0ea5e9; color: white; padding: 2px 5px; border-radius: 2px;");
    console.log("URL:", url);
    if (init?.headers) console.log("Headers:", init.headers);
    if (init?.body) {
        try {
            console.log('Body:', JSON.parse(init.body as string));
        } catch {
            console.log('Body:', init.body);
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