const { GoogleGenAI } = require("@google/genai");
const { buildHospitalContext } = require("../utils/contextBuilder");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const chatWithGemini = async (message, history = []) => {
  const dynamicContext = await buildHospitalContext(message);

  const SYSTEM = `
You are a helpful hospital assistant for a hospital booking system.
Use ONLY the HOSPITAL DATA given below.
If a user asks for something not in the data, say you don't have that information.
Keep replies short, friendly, and actionable.

HOSPITAL DATA:
${dynamicContext}
`.trim();

  const contents = [
    ...(history || []).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const resp = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: SYSTEM,
      temperature: 0.4,
      maxOutputTokens: 500,
    },
  });

  return resp.text;
};

module.exports = { chatWithGemini };
