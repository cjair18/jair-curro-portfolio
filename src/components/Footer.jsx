export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <h2>Let&apos;s connect</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Open to Analyst &amp; Associate roles in Product &amp; AI — or just
          say hi.
        </p>
        <div className="footer-links">
          <a className="btn btn-primary" href="mailto:jair_curro@hotmail.com">
            Email me
          </a>
          <a
            className="btn btn-ghost"
            href="https://www.linkedin.com/in/jair-curro-7b60a3297/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
        <p className="footer-copy">
          © {new Date().getFullYear()} Jair Curro · Miami, FL
        </p>
      </div>
    </footer>
  );
}
