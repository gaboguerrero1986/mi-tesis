const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const logFile = 'model_check_output.txt';

    const log = (msg) => {
        console.log(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, 'Starting model check...\n');

    // List of candidate models to try
    const modelsToTry = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-001",
        "gemini-pro",
        "gemini-1.0-pro",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest"
    ];

    for (const modelName of modelsToTry) {
        log(`Testing model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            const response = await result.response;
            log(`✅ SUCCESS: ${modelName} is working!`);
            log(`Response: ${response.text()}`);
            return; // Stop at first working model
        } catch (error) {
            log(`❌ FAILED: ${modelName}`);
            // Log partial error message to avoid clutter
            const msg = error.message || String(error);
            log(`   Error: ${msg.substring(0, 200)}...`);
        }
    }
    log('❌ All models failed.');
}

listModels();
