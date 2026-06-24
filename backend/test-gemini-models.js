const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set');
}

async function testGemini() {
  console.log('🚀 Testing Gemini API...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
      process.env.GEMINI_MODEL,
      'gemini-3.5-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
    ].filter(Boolean);

    let workingModel = null;

    for (const modelName of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(
          'Generate 3 interview questions for a developer.',
        );
        const response = result.response;
        const text = response.text();

        console.log(`✅ Model ${modelName} works!`);
        console.log(`   Response: ${text.substring(0, 200)}...\n`);
        workingModel = modelName;
        break;
      } catch (error) {
        console.log(`❌ Model ${modelName} failed: ${error.message}\n`);
      }
    }

    if (workingModel) {
      console.log(`✅ Success! Using model: ${workingModel}`);
    } else {
      console.log('❌ No working models found.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGemini();
