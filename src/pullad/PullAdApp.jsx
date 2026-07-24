import { useCallback, useState } from "react";
import { answerQuestion, EXAMPLE_QUESTIONS } from "./lib/reasoning.js";
import Chat from "./components/Chat.jsx";
import Dashboard from "./components/Dashboard.jsx";
import "./pullad.css";

let nextMessageId = 1;
function makeId() {
  return nextMessageId++;
}

// A small simulated "thinking" delay so the mocked reasoning layer feels
// like a live assistant rather than an instantaneous form submit.
const THINKING_DELAY_MS = 450;

/**
 * PullAd AI prototype, embedded from the standalone repo
 * (github.com/cjair18/pulled-ai). All data is mocked and the reasoning
 * layer is scripted — zero live API calls, by design.
 */
export default function PullAdApp() {
  const [messages, setMessages] = useState([]);
  // `context` is the `context` field from the last answerQuestion() result;
  // passing it into the next call is what lets reasoning.js support
  // bare-period follow-ups like "now show me last week".
  const [context, setContext] = useState(null);
  const [dashboardSpec, setDashboardSpec] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setMessages((prev) => [...prev, { id: makeId(), role: "user", text: trimmed }]);
      setLoading(true);

      window.setTimeout(() => {
        const result = answerQuestion(trimmed, context);

        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            text: result.answerText,
            examples: result.examples,
          },
        ]);
        setContext(result.context);
        // A "no match" result has no dashboardSpec — keep whatever
        // dashboard is already on screen rather than clearing it, so a
        // misunderstood question doesn't blow away the conversation's
        // existing chart.
        if (result.dashboardSpec) {
          setDashboardSpec(result.dashboardSpec);
        }
        setLoading(false);
      }, THINKING_DELAY_MS);
    },
    [context, loading],
  );

  return (
    <div className="pullad-scope">
      <div className="app-shell">
        <header className="app-header">
          <h1>PullAd AI</h1>
          <p>Ask plain-English questions about your marketing and sales.</p>
        </header>
        <main className="app-main">
          <Chat
            messages={messages}
            loading={loading}
            onSend={handleSend}
            exampleQuestions={EXAMPLE_QUESTIONS}
          />
          <Dashboard spec={dashboardSpec} />
        </main>
      </div>
    </div>
  );
}
