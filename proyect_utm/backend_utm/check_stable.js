const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function checkStable() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("Testing gemini-1.5-flash with new key...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Test");
        console.log(`✅ gemini-1.5-flash IS working! Response: ${result.response.text()}`);
    } catch (error) {
        console.log(`❌ gemini-1.5-flash failed: ${error.message}`);
    }
}

checkStable();
