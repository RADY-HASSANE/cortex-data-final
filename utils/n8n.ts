
export const extractStructuredData = (text: string) => {
  let json: any = null;
  let introText = "";
  
  const processParsedJson = (parsed: any): any => {
    if (!parsed) return null;

    // Cas spécifique n8n : { data: { content: "{...}" } }
    if (parsed.data?.content && typeof parsed.data.content === 'string') {
      try {
        const nested = JSON.parse(parsed.data.content);
        return processParsedJson(nested); // Récursif pour gérer l'imbrication
      } catch (e) {
        // Si ce n'est pas du JSON, on retourne tel quel
      }
    }

    if (Array.isArray(parsed) && parsed.length > 0) {
      if (parsed[0]?.output) return processParsedJson(parsed[0].output);
      if (parsed[0]?.data?.content) return processParsedJson(parsed[0].data.content);
      return parsed[0];
    }

    if (parsed.output && typeof parsed.output === 'object') return processParsedJson(parsed.output);
    
    return parsed;
  };

  const isStructured = (parsed: any): boolean => {
    if (!parsed) return false;
    return !!(
      parsed.category === "explanation_request" ||
      parsed.explanation ||
      parsed.user_level || // Nouveau format Coach IA
      parsed.type === "tutor_response" ||
      parsed.type === "exercise" ||
      parsed.category === "exercise_delivery" ||
      parsed.category === "quiz_batch" ||
      parsed.category === "mindmap_request" ||
      parsed.questions ||
      parsed.quiz_items ||
      parsed.mindmap_data
    );
  };

  try {
    const firstOpen = text.indexOf('{');
    const firstArrayOpen = text.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;
    
    if (firstOpen !== -1 && (firstArrayOpen === -1 || firstOpen < firstArrayOpen)) {
        startIdx = firstOpen;
        endIdx = text.lastIndexOf('}');
    } else if (firstArrayOpen !== -1) {
        startIdx = firstArrayOpen;
        endIdx = text.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx > startIdx) {
      const potentialJson = text.substring(startIdx, endIdx + 1);
      const parsedRaw = JSON.parse(potentialJson);
      const parsed = processParsedJson(parsedRaw);
      
      if (isStructured(parsed)) {
        json = parsed;
        introText = text.substring(0, startIdx).trim();
        introText = introText.replace(/```json/g, '').replace(/```/g, '').trim();
      }
    }
  } catch (e) {}

  if (!json) {
    try {
      const parsedRaw = JSON.parse(text);
      const parsed = processParsedJson(parsedRaw);
      if (isStructured(parsed)) json = parsed;
    } catch (e) {}
  }
  
  return { json, introText };
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendToN8n = async (
  message: string, 
  sessionId?: string, 
  language?: string, 
  userId?: string, 
  signal?: AbortSignal,
  retries = 3,
  audioBase64?: string,
  requestType?: string
): Promise<string> => {
  const webhookUrl = "https://hhass.app.n8n.cloud/webhook-test/cfa7ecea-4805-48e3-8284-1efac362d8f8";
  const payload: any = { 
    sessionId, 
    userId, 
    language, 
    requestType,
    message: message || ""
  };
  if (audioBase64) {
    payload.audio = audioBase64;
  }

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        mode: 'cors',
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal
      });
      const responseText = await response.text();
      if (!response.ok) throw new Error(`Status ${response.status}`);
      return responseText;
    } catch (error: any) {
      if (error.name === 'AbortError') throw error;
      const isNetwork = error.message.includes('fetch') || error.name === 'TypeError';
      if (isNetwork && i < retries) {
        await wait(1000 * Math.pow(2, i));
        continue;
      }
      throw new Error(isNetwork ? "Impossible de joindre le serveur. Vérifiez votre connexion ou l'état du webhook." : error.message);
    }
  }
  throw new Error('Échec après plusieurs tentatives');
};
