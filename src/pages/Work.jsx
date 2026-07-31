const experience = [
  {
    period: "May 2026 – Present",
    role: "Analyst Intern — Marketing & Research",
    org: "Amerant Bank · Miami, FL",
    bullets: [
      "Built a product campaign performance dashboard in Google Data Studio using Google Ads and GA4, defining marketing KPIs that guided launch decisions",
      "Gathered and documented business requirements for a client survey program, translating stakeholder needs into product specifications",
      "Led Qualtrics-based customer research, partnering with cross-functional stakeholders on requirements and running A/B tests to improve landing page conversion",
    ],
    tags: ["Google Ads", "GA4", "Data Studio", "Qualtrics", "A/B Testing"],
  },
  {
    period: "Aug 2025 – May 2026",
    role: "Business Analyst Intern — Product & AI",
    org: "Archangel Education & Technology · Miami, FL",
    bullets: [
      "Drafted structured data documentation to train and integrate FinAI, an API-based customer-facing AI support agent",
      "Partnered with leadership and engineering to translate business requirements into product improvements, supporting testing, iteration, and feature tracking in an Agile environment",
      "Collaborated cross-functionally to prioritize product roadmap features and inform decisions based on business needs and user feedback",
    ],
    tags: ["FinAI", "Agile", "Product Roadmap", "Product & AI"],
  },
  {
    period: "Nov 2023 – Jan 2024",
    role: "Analyst Intern",
    org: "Norwegian Cruise Line · Miami, FL",
    bullets: [
      "Analyzed booking behavior to support repeat business and increase revenue per client",
      "Used Salesforce, Excel, and basic SQL to track sales performance and customer engagement trends",
      "Identified opportunities to improve client retention through data-driven outreach",
    ],
    tags: ["SQL", "Salesforce", "Excel", "Customer Retention"],
  },
];

const cases = [
  {
    label: "AI Product Strategy · Solo Case Study · 2025",
    title: "Instacart — AI Meal Assistant",
    problem:
      "Instacart shoppers either have groceries but no meal ideas, or meal ideas but a tedious path to a filled cart.",
    approach:
      "Framed the problem, built personas, and mapped user stories for an AI feature that works both ways: suggest meals from your grocery order, or describe a meal and have Instacart fill your cart with the corresponding items.",
    outcome:
      "Designed the MVP and go-to-market plan — core flows, positioning, OKRs, and success metrics.",
    tags: ["Personas", "User Stories", "MVP Scoping", "Go-to-Market", "OKRs"],
  },
  {
    label: "AI Data Strategy · Solo Case Study · 2025",
    title: "Blackstone — BX AI Data Prioritization",
    problem:
      "Blackstone's internal AI (BX AI) needed a strategy for which data to feed it first, based on feedback from associates across different business units.",
    approach:
      "Analyzed the BX AI user dataset in Excel to identify key roles and data priorities, then ranked business units by urgency of need.",
    outcome:
      "Delivered a 9-slide product proposal outlining pain points and feature priorities, supported by data-driven visuals.",
    tags: ["Data Strategy", "Stakeholder Analysis", "Excel", "Product Proposal"],
  },
];

export default function Work() {
  return (
    <>
      <section className="section" style={{ paddingTop: "5.5rem" }}>
        <div className="container">
          <p className="eyebrow">Case studies</p>
          <h2 className="section-title">Product strategy work</h2>
          <p className="section-sub">
            Two solo case studies where I took a product from problem framing
            to proposal.
          </p>
          <div className="two-col">
            {cases.map((c) => (
              <article className="case-card" key={c.title}>
                <span className="case-label">{c.label}</span>
                <h3>{c.title}</h3>
                <div className="case-block">
                  <div className="case-block-title">Problem</div>
                  <p>{c.problem}</p>
                </div>
                <div className="case-block">
                  <div className="case-block-title">Approach</div>
                  <p>{c.approach}</p>
                </div>
                <div className="case-block">
                  <div className="case-block-title">Deliverable</div>
                  <p>{c.outcome}</p>
                </div>
                <div className="pill-row">
                  {c.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Experience</p>
          <h2 className="section-title">Where I&apos;ve worked</h2>
          <div>
            {experience.map((xp) => (
              <div className="xp-item" key={`${xp.org}-${xp.role}`}>
                <div className="xp-period">{xp.period}</div>
                <div className="xp-body">
                  <h3>{xp.role}</h3>
                  <div className="xp-org">{xp.org}</div>
                  <ul>
                    {xp.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <div className="xp-tags">
                    {xp.tags.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
