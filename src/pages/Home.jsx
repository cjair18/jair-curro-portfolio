import { Link } from "react-router-dom";

const focusAreas = [
  "Product Strategy",
  "Marketing Analytics",
  "AI Products",
  "Data Storytelling",
  "User Research",
  "Business Analysis",
];

const highlights = [
  {
    title: "Marketing & Research — Amerant Bank",
    text: "Building campaign performance reports in GA4 and Looker Studio, gathering survey requirements, and running A/B tests to improve landing page conversion.",
  },
  {
    title: "Product & AI — Archangel Education & Technology",
    text: "Business Analyst Intern supporting FinAI — structured data documentation for a customer-facing AI support agent, plus Agile feature prioritization with leadership and engineering.",
  },
  {
    title: "PM Case Studies — Instacart & Blackstone",
    text: "Solo product strategy case studies: an AI meal-planning feature for Instacart and a data prioritization strategy for Blackstone's internal AI.",
  },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-kicker">
            <span className="dot" />
            Product · Data · AI · Miami, FL
          </div>
          <h1>
            Analyst <span className="arrow">→</span> Product
          </h1>
          <p className="hero-tagline">
            I&apos;m <strong>Jair Curro</strong>. I turn data, user research,
            and business strategy into product decisions — with a background in
            marketing analytics, SaaS product work, and AI product strategy.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/work">
              See my work
            </Link>
            <a className="btn btn-ghost" href="mailto:jair_curro@hotmail.com">
              Get in touch
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Focus</p>
          <h2 className="section-title">Where product thinking meets data</h2>
          <p className="section-sub">
            The work I care about sits at the intersection of product
            strategy, analytics, and AI.
          </p>
          <div className="pill-row">
            {focusAreas.map((area) => (
              <span className="pill" key={area}>
                {area}
              </span>
            ))}
          </div>
          <div className="stat-row">
            <div className="stat">
              <div className="value">3</div>
              <div className="label">Analyst internships</div>
            </div>
            <div className="stat">
              <div className="value">2</div>
              <div className="label">Solo PM case studies</div>
            </div>
            <div className="stat">
              <div className="value">5</div>
              <div className="label">Product, data &amp; AI certifications</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">At a glance</p>
          <h2 className="section-title">What I&apos;ve been doing</h2>
          <div className="card-grid">
            {highlights.map((h) => (
              <div className="card" key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
