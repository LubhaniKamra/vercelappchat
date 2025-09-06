'use client';

import { useState, Fragment } from 'react';
import { Copy, Globe, RefreshCcw } from 'lucide-react';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: {
    type: 'text' | 'image';
    text?: string;
    base64?: string;
    mediaType?: string;
  }[];
};

// ✅ Azure OpenAI models
const models = [
  { name: 'GPT-3.5 Turbo', value: 'gpt-35-turbo' },
  { name: 'GPT-4o', value: 'gpt-4o' },
];

const ChatPage = () => {
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<string>('');

  // ✅ Azure OpenAI integration
  const sendMessageToLLM = async (text: string) => {
    setStatus('submitted');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          model,
          webSearch,
        }),
      });

      // First, simple response check (no streaming yet)
     const data = await res.json();
const assistantText = data.reply || "⚠️ No reply from model";


      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        parts: [{ type: 'text', text: assistantText }],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: 'assistant',
          parts: [{ type: 'text', text: '⚠️ Error fetching LLM response' }],
        },
      ]);
    } finally {
      setStatus('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      parts: [{ type: 'text', text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageToLLM(input);
    setInput('');
  };

  const regenerate = () => {
    const lastUser = messages.filter((m) => m.role === 'user').at(-1);
    if (lastUser) sendMessageToLLM(lastUser.parts[0]?.text ?? '');
  };

  return (
    <div className="container-fluid d-flex flex-column vh-100 p-0">
      {/* Chat Messages */}
      <div className="flex-grow-1 overflow-auto p-3 bg-light" style={{ marginBottom: '150px' }}>
        {messages.map((message) => (
          <div key={message.id} className="mb-3">
            {message.parts.map((part, i) => {
              if (part.type === 'text') {
                return (
                  <Fragment key={`${message.id}-txt-${i}`}>
                    <div
                      className={`p-2 my-2 rounded ${
                        message.role === 'user'
                          ? 'bg-primary text-white ms-auto w-75'
                          : 'bg-white text-dark me-auto border w-75'
                      }`}
                    >
                      {part.text}
                    </div>

                    {message.role === 'assistant' && i === message.parts.length - 1 && (
                      <div className="d-flex gap-2 ms-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={regenerate}>
                          <RefreshCcw size={14} /> Retry
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => navigator.clipboard.writeText(part.text ?? '')}
                        >
                          <Copy size={14} /> Copy
                        </button>
                      </div>
                    )}
                  </Fragment>
                );
              }

              return null;
            })}
          </div>
        ))}

        {status === 'submitted' && <div className="text-center text-muted">Thinking...</div>}
      </div>

      {/* Footer */}
      <div className="border-top bg-white p-3 position-fixed bottom-0 start-0 w-100" style={{ height: '150px' }}>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-2 h-100">
          <div className="d-flex gap-2">
            <input
              type="text"
              className="form-control"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={!input.trim()}>
              Send
            </button>
          </div>

          <div className="d-flex gap-2 mt-2 align-items-center">
            <button
              type="button"
              className={`btn btn-sm ${webSearch ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setWebSearch(!webSearch)}
            >
              <Globe size={14} /> Web Search
            </button>
            <select
              className="form-select w-auto"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
