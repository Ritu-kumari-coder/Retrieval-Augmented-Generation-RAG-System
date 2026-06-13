# Retrieval-Augmented Generation (RAG) System

A document question-answering system built using **LangChain**, **Google Gemini**, and **Pinecone**. The application enables users to ask natural language questions about PDF documents and receive context-aware answers generated using Retrieval-Augmented Generation (RAG).

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

## Tech Stack

* Node.js
* LangChain
* Google Gemini API
* Pinecone Vector Database
* PDF.js
* JavaScript (ES Modules)

---

## Project Structure

```text
RAG/
│
├── index.js               # PDF ingestion and vector indexing
├── query.js               # Query processing and retrieval pipeline
├── cse-module.pdf         # Sample document
├── dsa.pdf                # Sample document
├── RAG System.html        # Frontend interface
├── package.json
├── .env
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
text-embedding-004
```

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

---

## Environment Variables

Create a `.env` file:

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
cd RAG
```

Install dependencies:

```bash
npm install
```

---

## Index Documents

Run:

```bash
node index.js
```

This will:

* Load PDFs
* Split documents into chunks
* Generate embeddings
* Store vectors in Pinecone

---

## Start Chat Interface

Run:

```bash
node query.js
```

Ask questions directly from the terminal.

Example:

```text
Ask me anything --> What is Binary Search?
```

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
* Web-based chat interface
* User authentication
* Chat history persistence
* Response streaming
* Deployment using Vercel/Render
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

---

## Author

Developed as a learning project to explore Retrieval-Augmented Generation, vector search, and document-grounded AI applications.
