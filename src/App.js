import { Routes, Route, NavLink } from "react-router-dom";
//importing components and css//
import "./App.css";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";

function App() {
  return (
    <div className="App">
      <header className="navbar">
        <NavLink to="/" className="navbar-brand">
          <img src="/images/PhishIcon.svg" alt="" />
          <span>Phisher</span>  
        </NavLink>
        <nav className="navbar-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/HowItWorks">How It Works</NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/HowItWorks" element={<HowItWorks />} />
        </Routes>
      </main>

      <footer className="footer">
        <nav className="footer-links">
          <NavLink to="/About">About</NavLink>
          <NavLink to="/HowItWorks">How It Works</NavLink>
        </nav>
        <p>© 2026 Phisher</p>
      </footer>
    </div>
  );
}

export default App;