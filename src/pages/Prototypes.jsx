import { Link } from "react-router-dom";

const prototypes = [
  {
    label: "AI · Marketing Analytics · Live demo",
    title: "PullAd AI",
    description:
      "A conversational marketing-analytics assistant for small business owners — ask plain-English questions about ad spend and see how it connects to sales, with dashboards generated from the conversation. Runs on realistic mock Google Ads, GA4, and Shopify data with a scripted reasoning layer.",
    tags: ["React", "Vite", "Recharts", "Product Requirements", "Mock Data"],
    demoPath: "/pullad",
    repoUrl: "https://github.com/cjair18/pulled-ai",
  },
  {
    label: "AI · E-commerce Sourcing · Live demo",
    title: "SourceCheck AI",
    description:
      "An AI sourcing assistant for Amazon FBA/FBM sellers — scan an ASIN or UPC to get variant-accurate sales data, fee-aware profit math, and a Buy / Don't Buy verdict. Runs in mock-data mode with realistic Keepa-shaped fixtures and a rule-based verdict engine.",
    tags: ["Next.js", "TypeScript", "Tailwind", "API Design", "Mock Data"],
    demoUrl: "https://sourcecheck-ai.vercel.app",
    repoUrl: "https://github.com/cjair18/sourcecheck-ai",
  },
];

export default function Prototypes() {
  return (
    <section className="section" style={{ paddingTop: "5.5rem" }}>
      <div className="container">
        <p className="eyebrow">Prototypes</p>
        <h2 className="section-title">Things you can actually try</h2>
        <p className="section-sub">
          Working, interactive prototypes I&apos;ve built — not mockups. Each
          one is scoped, specced, and shipped like a real product, from
          product brief to requirements to working build.
        </p>
        <div className="two-col">
          {prototypes.map((p) => (
            <article className="case-card" key={p.title}>
              <span className="case-label">{p.label}</span>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <div className="pill-row">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
              <div className="hero-actions" style={{ marginTop: "0.5rem" }}>
                {p.demoPath ? (
                  <Link to={p.demoPath} className="btn btn-primary">
                    Launch demo →
                  </Link>
                ) : (
                  <a
                    href={p.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary"
                  >
                    Launch demo ↗
                  </a>
                )}
                <a
                  href={p.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-ghost"
                >
                  Source & docs
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
