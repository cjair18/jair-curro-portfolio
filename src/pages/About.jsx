const interests = [
  {
    title: "AI & Semiconductors",
    text: "I follow the AI chip and quantum computing space closely — both the technology and the market behind it, including tech-heavy indices like QQQ.",
  },
  {
    title: "Space",
    text: "SpaceX launches and NASA missions are a standing interest. I love watching hard engineering problems get solved in public.",
  },
  {
    title: "Data Centers & Real Estate",
    text: "I study how AI data centers are reshaping infrastructure investment, alongside single-family home investing.",
  },
  {
    title: "Self-directed Learning",
    text: "Most of my interests turn into research projects — markets, technology, and strategy are what I read about for fun.",
  },
];

export default function About() {
  return (
    <>
      <section className="section" style={{ paddingTop: "5.5rem" }}>
        <div className="container">
          <p className="eyebrow">About</p>
          <h2 className="section-title">Strategy and technology, together</h2>
          <p className="section-sub" style={{ marginBottom: "1.25rem" }}>
            Analyst in Miami, FL, transitioning into product management.
          </p>
          <div style={{ maxWidth: 720, color: "var(--text-secondary)" }}>
            <p style={{ marginBottom: "1rem" }}>
              My foundation is in data. At Amerant Bank I built a Google Ads and
              GA4 campaign dashboard in Data Studio, led Qualtrics research, and
              supported A/B testing; at Norwegian Cruise Line I worked with
              sales and customer engagement data; and at Archangel Education
              &amp; Technology I supported Product &amp; AI as a Business
              Analyst Intern — including structured data work to train and
              integrate FinAI as an API-based customer-facing support agent.
            </p>
            <p style={{ marginBottom: "1rem" }}>
              Product management sits at the intersection of what I do best —
              strategy, analysis, and technology. Working across marketing,
              sales, and product teams has shown me that my strengths lie in
              framing problems, prioritizing with data, and aligning
              stakeholders around a clear direction.
            </p>
            <p>
              To build on that experience, I completed BrainStation&apos;s
              Product Management certificate and developed independent AI
              product case studies for Instacart and Blackstone — taking each
              from problem definition through personas, MVP scope, and
              go-to-market strategy.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Education</p>
          <h2 className="section-title">Where I studied</h2>
          <div className="two-col">
            <div className="card">
              <h3>B.S. Data Analytics</h3>
              <p>Miami Dade College · 2025 – 2026</p>
            </div>
            <div className="card">
              <h3>A.A. Business Administration</h3>
              <p>Miami Dade College · 2024 – 2025</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Beyond work</p>
          <h2 className="section-title">What keeps me curious</h2>
          <div className="card-grid">
            {interests.map((i) => (
              <div className="card" key={i.title}>
                <h3>{i.title}</h3>
                <p>{i.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
