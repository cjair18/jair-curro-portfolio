import { Link } from "react-router-dom";

const experience = [
  {
    period: "May 2026 – Present",
    role: "Analyst Intern — Marketing & Research",
    org: "Amerant Bank · Miami, FL",
    bullets: [
      "Analyze website and campaign performance data — including a HELOC marketing campaign — to support data-driven decisions",
      "Track paid media metrics such as CPC and ROAS to evaluate campaign efficiency",
      "Support A/B testing efforts aimed at improving user experience and engagement",
      "Partner with marketing and web teams to optimize content and digital performance",
    ],
    tags: ["Google Analytics", "A/B Testing", "CPC / ROAS", "Campaign Analysis"],
  },
  {
    period: "Aug 2025 – May 2026",
    role: "Analyst Intern — Product",
    org: "Archangel Education & Technology · Miami, FL",
    bullets: [
      "Contributed to a device management SaaS product, working directly with the UX/UI designer, business analyst, CIO, and CEO",
      "Translated business needs into product improvements and helped drive execution",
      "Supported testing, iteration, and feature tracking in an Agile environment",
      "Helped prioritize features based on business needs and user feedback",
    ],
    tags: ["Agile", "Feature Prioritization", "SaaS", "Cross-functional"],
  },
  {
    period: "Nov 2023 – Jan 2024",
    role: "Analyst Intern",
    org: "Norwegian Cruise Line · Miami, FL",
    bullets: [
      "Analyzed booking behavior to support repeat business and increase revenue per client",
      "Worked with sales data — profit, revenue, margin, and cost — to track performance",
      "Used Salesforce, Excel, and SQL to monitor sales and customer engagement trends",
      "Identified opportunities to improve client retention through data-driven outreach",
    ],
    tags: ["SQL", "Salesforce", "Excel", "Revenue Analysis"],
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
          <p className="eyebrow">Live prototype</p>
          <h2 className="section-title">PullAd AI</h2>
          <p className="section-sub">
            A working, interactive prototype of a conversational
            marketing-analytics assistant — ask plain-English questions about
            ad spend and see how it connects to sales, with dashboards
            generated from the conversation. Built with React, Vite, and
            Recharts on fully mocked data.
          </p>
          <Link to="/pullad" className="btn btn-primary">
            Try the live demo →
          </Link>
        </div>
      </section>

      <section className="section">
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
              <div className="xp-item" key={xp.role}>
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
