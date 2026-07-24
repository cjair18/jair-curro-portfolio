import { useEffect, useRef, useState } from "react";

/**
 * Chat panel: message history (user + assistant, visually distinguished),
 * a text input, and example-question chips for the empty state and for
 * "no match" answers (which come with `examples` from reasoning.js).
 */
export default function Chat({ messages, loading, onSend, exampleQuestions }) {
  const [input, setInput] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  }

  function handleExampleClick(question) {
    if (loading) return;
    onSend(question);
  }

  const showWelcome = messages.length === 0;

  return (
    <section className="chat-panel" aria-label="Chat with PullAd AI">
      <div className="chat-messages" ref={listRef}>
        {showWelcome && (
          <div className="chat-welcome">
            <p className="chat-welcome-title">
              Hi, I&rsquo;m PullAd AI. Ask me anything about your ad spend and
              how it&rsquo;s connecting to sales &mdash; try one of these:
            </p>
            <div className="example-chips">
              {exampleQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  type="button"
                  className="example-chip"
                  onClick={() => handleExampleClick(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`chat-row chat-row--${m.role}`}>
            <div className={`chat-bubble chat-bubble--${m.role}`}>
              <p>{m.text}</p>
              {m.examples && m.examples.length > 0 && (
                <div className="example-chips example-chips--inline">
                  {m.examples.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="example-chip"
                      onClick={() => handleExampleClick(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-row chat-row--assistant">
            <div className="chat-bubble chat-bubble--assistant chat-bubble--thinking">
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-row" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your marketing..."
          aria-label="Ask a question"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}
