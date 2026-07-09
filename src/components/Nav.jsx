import { NavLink, Link } from "react-router-dom";

export default function Nav() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          Jair Curro<span>.</span>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/work">Work</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/credentials">Credentials</NavLink>
        </nav>
      </div>
    </header>
  );
}
