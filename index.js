import * as dotenv from 'dotenv';
dotenv.config();

import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

async function indexDocument() {
    /*loading pdf*/
    const PDF_PATH = './cse-module.pdf';
    
    const pdfLoader = new PDFLoader(PDF_PATH, {
        // Updated to use the correct v4+ modern import
        pdfjs: () => import("pdfjs-dist"), 
    });

    const rawDocs = await pdfLoader.load();
        
    console.log(`PDF Loaded...`);

    /*chunking*/

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000, //characters
        chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

    console.log("Chunking completed...");

    /* 3. Safety Filter (Crucial to prevent Pinecone crashes) */
    const validDocs = chunkedDocs.filter(
        (doc) => doc.pageContent && doc.pageContent.trim().length > 0
    );
    console.log(`Filtered down to ${validDocs.length} valid chunks with actual text...`);

    /*converting into vector : vector embedding model*/

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });
    console.log("Embedding model configured...");


    /*Configure Databse*/
    
    //Initialise pinecone client
    const pinecone = new Pinecone(); //automatically takes api key and region and make connection
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log("Pinecone configured...");

    /*Langchain takes chunks, embed in vector as per embedding model provided and store it in database providded*/
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5,
    });
    console.log("Data stored successfully...");

}

indexDocument();