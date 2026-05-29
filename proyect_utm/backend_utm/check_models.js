const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init to get access to client if needed, or just use unrelated call if SDK supports it.
        // actually SDK doesn't have direct listModels on the instance easily exposed in all versions, 
        // but let's try a direct fetch if the SDK usage is obscure, 
        // OR just try to use the model that SHOULD exist. 

        // Better yet, let's just try to generate content with a few variations to see which one works.
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];

        for (const modelName of modelsToTry) {
            console.log(`Testing model: ${modelName}...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                const response = await result.response;
                console.log(`✅ SUCCESS: ${modelName} is working!`);
                return; // Found one!
            } catch (error) {
                console.log(`❌ FAILED: ${modelName} - ${error.message.split('\n')[0]}`);
            }
        }

    } catch (e) {
        console.error(e);
    }
}

listModels();
