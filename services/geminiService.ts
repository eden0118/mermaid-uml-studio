import { GoogleGenAI } from "@google/genai";

const getClient = (): GoogleGenAI => {
    const apiKey = process.env.API_KEY || ''; 
    // In a real scenario, we might prompt user for key if env is missing, 
    // but per instructions we assume process.env.API_KEY is available/handled.
    return new GoogleGenAI({ apiKey });
};

export const generateMermaidCode = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure your environment.");
  }

  const ai = getClient();
  
  const systemInstruction = `
    You are an expert in Mermaid.js diagram syntax.
    Your task is to convert the user's natural language description into valid Mermaid.js code.
    
    Rules:
    1. Output ONLY the Mermaid code.
    2. Do not wrap the code in markdown code blocks (e.g., no \`\`\`mermaid).
    3. Do not include any explanation or conversational text.
    4. Ensure syntax is correct to avoid rendering errors.
    5. If the user asks for a specific diagram type (Sequence, Class, Gantt, etc.), use that. Otherwise, default to Flowchart or Graph.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2, // Low temperature for more deterministic code generation
      },
    });

    let text = response.text || '';
    
    // Cleanup in case the model ignores the "no markdown" rule
    text = text.replace(/^```mermaid\n/, '').replace(/^```\n/, '').replace(/```$/, '').trim();
    
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate diagram code.");
  }
};
