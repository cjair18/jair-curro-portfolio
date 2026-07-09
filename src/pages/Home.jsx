import { Link } from "react-router-dom";

const targetRoles = [
  "AI Program Associate",
  "AI Analyst",
  "AI Associate Product Manager",
  "Product Manager",
  "Product Strategy Analyst",
  "Product Analyst",
  "Business Analyst",
];

const highlights = [
  {
    title: "Marketing & Research — Amerant Bank",
    text: "Analyzing HELOC campaign performance (CPC, ROAS) and supporting A/B testing to improve digital engagement.",
  },
  {
    title: "Product — Archangel Education & Technology",
    text: "Contributed to a device management SaaS in an Agile team alongside the UX/UI designer, business analyst, CIO, and CEO.",
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
            Open to Analyst &amp; Associate roles in Product &amp; AI · Miami, FL
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
          <p className="eyebrow">Looking for</p>
          <h2 className="section-title">Roles I&apos;m targeting</h2>
          <p className="section-sub">
            Analyst and Associate-level roles where product thinking and data
            meet.
          </p>
          <div className="pill-row">
            {targetRoles.map((role) => (
              <span className="pill" key={role}>
                {role}
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
              <div className="value">4</div>
              <div className="label">Product &amp; data certifications</div>
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
