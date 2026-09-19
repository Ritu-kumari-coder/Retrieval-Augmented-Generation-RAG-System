# Retrieval-Augmented Generation (RAG) System

A document question-answering system built using **LangChain**, **Google Gemini**, and **Pinecone**. The application enables users to ask natural language questions about PDF documents and receive context-aware answers generated using Retrieval-Augmented Generation (RAG). It includes a **React chat interface** backed by an **Express API**.

<!-- Add a screenshot here: ![Chat UI](docs/screenshot.png) -->

## Features

* PDF document ingestion
* Automatic document chunking
* Embedding generation using Gemini Embeddings
* Vector storage using Pinecone
* Semantic similarity search
* Context-aware answer generation
* Conversational memory support
* Query rewriting for follow-up questions
* Hallucination reduction through retrieval-based grounding
* React chat interface with markdown and code rendering
* Express REST API connecting the frontend to the RAG pipeline

---

## Architecture

```text
PDF Documents
      │
      ▼
PDF Loader
      │
      ▼
Text Chunking
      │
      ▼
Gemini Embeddings
      │
      ▼
Pinecone Vector Database
      │
      ▼
Semantic Retrieval
      │
      ▼
Context Construction
      │
      ▼
Gemini LLM
      │
      ▼
Generated Answer
```

### Application Flow

```text
React Frontend  ──POST /api/chat──▶  Express Server  ──▶  RAG Pipeline
 (Vite, :5173)                        (Node, :3000)        (Query rewrite → Pinecone → Gemini)
       ▲                                                          │
       └──────────────────── JSON answer ◀────────────────────────┘
```

## Tech Stack

* Node.js
* LangChain
* Google Gemini API
* Pinecone Vector Database
* PDF.js
* JavaScript (ES Modules)
* Express (REST API)
* React + Vite (frontend)
* react-markdown (answer formatting)

---

## Project Structure

```text
Retrieval-Augmented-Generation-RAG-System/
│
├── backend/
│   ├── index.js           # PDF ingestion and vector indexing
│   ├── server.js          # Express API and retrieval pipeline
│   ├── cse-module.pdf     # Sample document
│   ├── dsa.pdf            # Sample document
│   ├── package.json
│   ├── .env               # API keys (not committed)
│   └── .env.example       # Template for required variables
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Chat interface
│   │   ├── App.css        # Styling
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js     # Dev proxy to the API
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## How It Works

### Step 1: Document Ingestion

PDF documents are loaded using LangChain's PDFLoader.

### Step 2: Chunking

Documents are split into smaller chunks using RecursiveCharacterTextSplitter.

```javascript
chunkSize: 1000
chunkOverlap: 200
```

### Step 3: Embedding Generation

Each chunk is converted into a vector embedding using Google's embedding model.

```javascript
gemini-embedding-2-preview
```

The Pinecone index must be created with dimension `3072` and the `cosine` metric to match this model.

### Step 4: Vector Storage

Embeddings are stored in Pinecone for efficient similarity search.

### Step 5: Retrieval

User queries are embedded and matched against stored vectors.

```javascript
topK: 10
```

The most relevant chunks are retrieved.

### Step 6: Response Generation

Retrieved context is provided to Gemini, which generates an answer grounded in the document content.

### Step 7: Web Interface

The React frontend sends each question, along with the previous conversation, to the Express server. The server rewrites follow-up questions into standalone queries, runs the retrieval pipeline, and returns the answer, which the frontend renders with markdown and code formatting.

---

## API

### `POST /api/chat`

Request body:

```json
{
  "question": "What is Binary Search?",
  "history": [
    { "role": "user", "text": "What is a sorted array?" },
    { "role": "model", "text": "A sorted array is..." }
  ]
}
```

Response:

```json
{ "answer": "Binary search is..." }
```

`history` is optional and can be omitted for the first question.

---

## Environment Variables

Create a `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/Ritu-kumari-coder/Retrieval-Augmented-Generation-RAG-System
cd Retrieval-Augmented-Generation-RAG-System
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

---

## Index Documents

Run:

```bash
cd backend
node index.js
```

This will:

* Load PDFs
* Split documents into chunks
* Generate embeddings
* Store vectors in Pinecone

Run this once per document. Running it again adds duplicate chunks unless the index is cleared first.

---

## Start the Application

The backend and frontend run in two separate terminals.

**Terminal 1: API server**

```bash
cd backend
node server.js
```

The API starts on `http://localhost:3000`.

**Terminal 2: React frontend**

```bash
cd frontend
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`) and start asking questions.

---

## Sample Queries

```text
What is Dynamic Programming?

Explain Binary Search.

What is the time complexity of Merge Sort?

What are graph traversal algorithms?
```

---

## Future Improvements

* Source citation support
* Multi-document filtering
* User authentication
* Chat history persistence
* Response streaming
* Evaluation metrics for retrieval quality

---

## Learning Outcomes

Through this project, I gained practical experience with:

* Retrieval-Augmented Generation (RAG)
* Vector Databases
* Semantic Search
* Embeddings
* Prompt Engineering
* Context-Aware Question Answering
* LangChain Workflows
* Pinecone Integration
* Large Language Model Applications
* Building a REST API with Express
* Building a React chat interface that consumes it

---
