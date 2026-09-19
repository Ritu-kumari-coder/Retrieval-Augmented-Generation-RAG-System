import * as dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

async function testGoogleAPI() {
    console.log("Checking API Key: ", process.env.GEMINI_API_KEY ? "Key exists" : "KEY MISSING!");
    
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'gemini-embedding-2-preview', 
    });

    try {
        console.log("Sending test query to Google Gemini...");
        const result = await embeddings.embedQuery("This is a simple test document.");
        console.log(`Success! Generated vector with ${result.length} dimensions.`);
    } catch (error) {
        console.error("ACTUAL GOOGLE ERROR DETAILS:");
        console.error(error);
    }
}

testGoogleAPI();