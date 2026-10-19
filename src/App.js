//importing components and css//
import { Routes, Route, NavLink } from "react-router-dom"; 
import "./App.css";
import './pages/Home.css';
import './pages/Results.css';
import Home from "./pages/Home";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowitWorks";
import About from "./pages/About";
import Results from "./pages/Results";

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
          <NavLink to="/HowitWorks">How it Works</NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Features" element={<Features />} />
          <Route path="/HowitWorks" element={<HowItWorks />} />
          <Route path="/results" element={<Results />} />

          {/*for any address that is invalid send to error screen*/}
          <Route
            path="*"
            element={
              <div className="error-screen">
                <h1>Error: page not found</h1>
                <p>This page doesn't exist.</p>
                <NavLink to="/" className="home-btn">Back to Home</NavLink>
              </div>
            }
          />
        </Routes>
      </main>


      <footer className="footer">
        <nav className="footer-links">
          <NavLink to="/About">About</NavLink>
          <NavLink to="/Features">Features</NavLink>
          <NavLink to="/HowitWorks">How it Works</NavLink>
        </nav>
        <p>© 2026 Phisher</p>
      </footer>
    </div>
  );
}


export default App;