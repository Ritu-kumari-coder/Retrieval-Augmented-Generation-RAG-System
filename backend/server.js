import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json());

// Create clients once, not on every request
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  model: 'text-embedding-004',
});
const pinecone = new Pinecone();
const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

// history from the browser: [{ role: 'user' | 'model', text: '...' }]
const toContents = (history) =>
  history.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

async function transformQuery(question, history) {
  // First question has no history, nothing to rewrite
  if (history.length === 0) return question;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [...toContents(history), { role: 'user', parts: [{ text: question }] }],
    config: {
      systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrase the "Follow Up user Question" into a complete, standalone question that can be understood without the chat history.
Only output the rewritten question and nothing else.`,
    },
  });
  return response.text;
}

async function answer(question, history) {
  const query = await transformQuery(question, history);

  const queryVector = await embeddings.embedQuery(query);

  const searchResults = await pineconeIndex.query({
    topK: 10,
    vector: queryVector,
    includeMetadata: true,
  });

  const context = searchResults.matches
    .map((match) => match.metadata.text)
    .join('\n\n---\n\n');

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [...toContents(history), { role: 'user', parts: [{ text: query }] }],
    config: {
      systemInstruction: `You have to behave like a Data Structure and Algorithm Expert.
You will be given a context of relevant information and a user question.
Your task is to answer the user's question based ONLY on the provided context.
If the answer is not in the context, you must say "I could not find the answer in the provided document."
Keep your answers clear, concise, and educational.

Context: ${context}`,
    },
  });

  return response.text;
}

app.post('/api/chat', async (req, res) => {
  const { question, history = [] } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  try {
    const text = await answer(question.trim(), history);
    res.json({ answer: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong while answering. Check the server logs.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
