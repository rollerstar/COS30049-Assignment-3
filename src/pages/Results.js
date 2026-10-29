import { useLocation, Link } from "react-router-dom"; //data from home
import "./Results.css";

//score results, own titles and everything under 20 is safe
function riskLabel(score) {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Safe";
}

function Results() {
  const location = useLocation(); //reads what home sent
  const url = location.state?.url || ""; //only filled when url comes from home

  if (!url.trim()) { //opening the results page when nothing searched
    return (
      <div className="error-screen">
        <h1>No valid URL entered</h1>
        <p>There are no results to show. Enter a valid URL from Home to proceed.</p>
        <Link to="/" className="home-btn">Back to Home</Link>
      </div>
    );
  }

  const score = 10; //placeholder score

  const checks = [ //placeholder for moment replace w/ backend *yes or no(?) can change later
    { label: "Suspicious Length", value: "No", flagged: false },
    { label: "Suspicious Keywords", value: "Yes", flagged: true },
    { label: "IP Address", value: "No", flagged: false },
    { label: "URL With @", value: "No", flagged: false },
    { label: "Look-Alike Characters", value: "Yes", flagged: true },
    { label: "Suspicious TLD", value: "Yes", flagged: true },
  ];

  return (//returned
    <div className="results">
      {/*domain score on left*/}
      <section className="score-card">
        <h2 className="box">Domain Score</h2>

        <div className="score-ring">
          <img src="/images/hookresults.svg" alt="" />
          <span className="score-text">{score}%</span> {/*on top of svg*/}
        </div>

        <p className="box risk-label">{riskLabel(score)}</p>
      </section>

      {/*url above summary*/}
      <div className="summary-col">
        <p className="summary-url">{url}</p>

        <section className="summary-card">
          <h2 className="box">Summary</h2>

          <ul className="check-list">
            {checks.map((c) => (
              <li key={c.label} className="check-row">
                <span className="sep-line">{c.label}</span>{/*line that separates checks*/}
                <span className="value-box">{c.value}</span>{/*box with result value*/}
                <span className="warning-flag">
                  {c.flagged && (//icon shows if flag is true, else nothing
                    <img src="/images/warningicon.svg" alt="Flagged" />
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    {/*button for scan another with reload svg */}
      <Link to="/" className="scan-btn">
        Scan Another
        <img src="/images/reloadicon.svg" alt="" />
      </Link>
    </div>
  );
}

export default Results;