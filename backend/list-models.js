const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // For the latest SDK, we might need to use the model manager or just try to get a model and see if we can list.
    // Actually, the SDK doesn't have a direct 'listModels' on the top level instance in all versions, 
    // but let's try to use the API directly if the SDK method isn't obvious, 
    // or check if the SDK exposes it. 
    // Looking at documentation, usually it's via the API.
    // Let's try a simple fetch to the API endpoint if SDK fails, but let's try SDK first if possible.
    // Wait, the error message says "Call ListModels".
    
    // In newer SDKs, it might not be directly exposed easily without a model instance.
    // Let's try a direct REST call to be sure, as it's dependency-free regarding SDK quirks.
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing');
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach(m => {
        if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log('No models found or error:', data);
    }
    
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
