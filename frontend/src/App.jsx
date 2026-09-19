import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const SUGGESTIONS = [
  'Explain binary search with an example',
  'What is the difference between a stack and a queue?',
  'How does a hash table handle collisions?',
];

export default function App() {
  const [messages, setMessages] = useState([]); // { role: 'user' | 'model', text, error? }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text) {
    const question = text.trim();
    if (!question || loading) return;

    // Only real exchanges go to the server as history, not error bubbles
    const history = messages
      .filter((m) => !m.error)
      .map(({ role, text }) => ({ role, text }));

    setMessages((prev) => [...prev, { role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed.');
      setMessages((prev) => [...prev, { role: 'model', text: data.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: err.message, error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>DSA Instructor</h1>
        <p>Answers come only from your course document.</p>
      </header>

      <main className="chat">
        {messages.length === 0 && (
          <div className="empty">
            <p>Ask a question about the module, or start with one of these:</p>
            <div className="suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}${m.error ? ' error' : ''}`}>
            {m.role === 'model' ? (
              <ReactMarkdown>{m.text}</ReactMarkdown>
            ) : (
              <p>{m.text}</p>
            )}
          </div>
        ))}

        {loading && (
          <div className="msg model" aria-label="Instructor is thinking">
            <span className="dots">
              <i /><i /><i />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="composer">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about arrays, trees, graphs, sorting…"
          aria-label="Your question"
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}>
          Send
        </button>
      </footer>
    </div>
  );
}
