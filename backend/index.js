import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

// Delay utility to prevent rate limit errors
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function indexDocument() {
    /*loading pdf*/
    const PDF_PATH = './dsa.pdf';
    
    const pdfLoader = new PDFLoader(PDF_PATH, {
        // Updated to use the correct v4+ modern import
        pdfjs: () => import("pdfjs-dist"), 
    });

    const rawDocs = await pdfLoader.load();
        
    console.log(`PDF Loaded...`);

    /*chunking*/

    const textSplitter = new RecursiveCharacterTextSplitter({ //[cite: 1]
        chunkSize: 1000, //characters
        chunkOverlap: 200,
    }); //[cite: 1]
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

    console.log("Chunking completed...");

    /* 3. Safety Filter (Crucial to prevent Pinecone crashes) */
    const validDocs = chunkedDocs.filter( //[cite: 1]
        (doc) => doc.pageContent && doc.pageContent.trim().length > 0
    ); //[cite: 1]
    console.log(`Filtered down to ${validDocs.length} valid chunks with actual text...`);

    /*converting into vector : vector embedding model*/

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'gemini-embedding-2-preview', 
        maxConcurrency: 1, 
        maxRetries: 5
    }); 
    console.log("Embedding model configured...");

    /*Configure Databse*/
    
    //Initialise pinecone client
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log("Pinecone configured...");

    /* Langchain takes chunks in batches to prevent 429 Rate Limit errors */
    const BATCH_SIZE = 10; 

    for (let i = 0; i < validDocs.length; i += BATCH_SIZE) {
        const batch = validDocs.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(validDocs.length / BATCH_SIZE)}...`);
        
        await PineconeStore.fromDocuments(batch, embeddings, {
            pineconeIndex,
            maxConcurrency: 1, 
        });
        
        // Skip the delay if this is the final batch
        if (i + BATCH_SIZE < validDocs.length) {
            console.log(`Batch successful. Waiting 60 seconds to reset Google Gemini RPM limit...`);
            await delay(60000); 
        }
    }
    console.log("All data stored successfully...");

}

indexDocument();