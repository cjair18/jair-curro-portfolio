const certifications = [
  {
    title: "NIST AI RMF: AI Risk Management & AI Governance",
    org: "Udemy",
    year: "2026",
  },
  {
    title: "AI Fluency: Framework & Foundations",
    org: "Anthropic",
    year: "2026",
  },
  {
    title: "Product Management Certificate",
    org: "BrainStation",
    year: "2025",
  },
  {
    title: "Data Analytics Certificate",
    org: "Google · Coursera",
    year: "2026",
  },
  {
    title: "Data Visualization Certification",
    org: "Accenture",
    year: "Completed",
  },
  {
    title: "Product Strategy Micro-Certification",
    org: "Micro-credential",
    year: "Completed",
  },
];

const skillGroups = [
  {
    title: "Product",
    skills: [
      "Requirements Gathering",
      "User Stories",
      "MVP Scoping",
      "Agile Environment",
      "SOPs",
    ],
  },
  {
    title: "Business & Analytics",
    skills: ["Data Storytelling", "KPIs & Metrics", "User Research"],
  },
  {
    title: "Tools",
    skills: [
      "Jira",
      "Monday",
      "SQL",
      "Tableau",
      "Excel",
      "Google Analytics",
      "Data Studio / Looker Studio",
      "Qualtrics",
      "Salesforce",
    ],
  },
];

export default function Credentials() {
  return (
    <>
      <section className="section" style={{ paddingTop: "5.5rem" }}>
        <div className="container">
          <p className="eyebrow">Credentials</p>
          <h2 className="section-title">Certifications</h2>
          <p className="section-sub">
            Formal training backing the pivot from analytics into product.
          </p>
          <div className="card-grid">
            {certifications.map((c) => (
              <div className="card" key={c.title}>
                <h3>{c.title}</h3>
                <p>
                  {c.org} · {c.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="eyebrow">Skills</p>
          <h2 className="section-title">What I work with</h2>
          <div className="card-grid">
            {skillGroups.map((g) => (
              <div className="card" key={g.title}>
                <h3>{g.title}</h3>
                <div className="pill-row" style={{ marginTop: "0.75rem" }}>
                  {g.skills.map((s) => (
                    <span className="pill" key={s}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
