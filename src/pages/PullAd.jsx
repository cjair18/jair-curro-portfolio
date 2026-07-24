import PullAdApp from "../pullad/PullAdApp.jsx";

export default function PullAd() {
  return (
    <section className="section" style={{ paddingTop: "5.5rem" }}>
      <div className="container">
        <p className="eyebrow">Live prototype</p>
        <h2 className="section-title">PullAd AI</h2>
        <p className="section-sub">
          A conversational marketing-analytics assistant for small business
          owners: ask plain-English questions about ad spend and see how it
          connects to sales, with a contextual dashboard that builds as the
          conversation continues. This demo runs entirely on realistic mock
          data (Google Ads, GA4, Shopify) with a scripted reasoning layer —
          zero live API calls, by design. Try one of the suggested questions
          below, then follow up with something like &ldquo;now show me last
          week.&rdquo;
        </p>
        <PullAdApp />
        <p className="section-sub" style={{ marginTop: "1.5rem", marginBottom: 0 }}>
          Built with React, Vite, and Recharts. Product brief, requirements,
          and source are on{" "}
          <a
            href="https://github.com/cjair18/pulled-ai"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent)" }}
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </section>
  );
}
