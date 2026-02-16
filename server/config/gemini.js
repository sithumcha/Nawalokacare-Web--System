const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const chatWithGemini = async (message, history = []) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    });

    // Format history for Gemini
    let formattedHistory = [];
    if (history && history.length > 0) {
      formattedHistory = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
    }

    // System prompt එක පළමු message එකට add කරන්න
    let finalMessage = message;
    if (!history || history.length === 0) {
      finalMessage = `You are a helpful hospital assistant. Information:
- Hours: Mon-Fri 9am-6pm, Sat 9am-2pm, Sun closed
- Emergency: 24/7
- Appointment: Online/Phone/Walk-in
- Contact: (555) 123-4567

Be friendly and helpful. Keep responses short.

User: ${message}`;
    }

    const chat = model.startChat({
      history: formattedHistory,
      generationConfig: {
        maxOutputTokens: 500,
      },
    });

    const result = await chat.sendMessage(finalMessage);
    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

module.exports = { chatWithGemini };