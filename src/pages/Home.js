import { useEffect, useState } from "react";
import axios from "axios";


const FEATURE_LABELS = {
  url_length: "URL length",
  hostname_length: "Hostname length",
  num_dots: "Number of dots",
  num_hyphens: "Number of hyphens",
  num_digits: "Number of digits",
  has_ip_host: "IP address as host",
  has_at_symbol: "Contains @ symbol"
};


//adds https if url has no scheme and removes space from the end
function normaliseUrl(value) {
  const trimmed = value.trim();
  //checks if text starts with a scheme like http:// and adds https:// if not
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}


//checks if input looks like a url/host
function looksLikeUrl(value) {
  const trimmed = value.trim();
  //returns false if input is empty or contains spaces
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    //adds https if missing, then parses it
    const parsed = new URL(normaliseUrl(trimmed));
    return parsed.hostname.includes(".") || parsed.hostname.includes(":");
  } catch {
    //text could not be parsed as a url
    return false;
  }
}


// Emoji Scoring
const getVerdict = (score) => {
  if(score <= 20) return {emoji: "💀", text: "Likely Phishing", tone: "danger"};
  if(score < 50) return {emoji: "❓", text: "Suspicious", tone: "warning"};
  return { emoji: "✅", text: "Looks safe", tone:"safe"}
}


// Yes/No Bolding and colour adjustment
const renderValue = (key, value) => {
  if(key.startsWith("has_")){
    return (
      <strong className={value ? "value-bad" : "value-good"}>
        {value ? "Yes" : "No"}
      </strong>
    );
  }
  return value;
};


// Count up from 0 to verdict score (for animation)
function useCountUp(target, duration = 1200){
  const [value, setValue] = useState(0);


useEffect(() => {
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setValue(target);
    return;
  }


  let frame;
  const start = performance.now();


  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // Ease-Out
    setValue(target * eased);
    if(progress < 1) frame = requestAnimationFrame(tick);
  };


  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}, [target, duration]);


return value;
}


function ResultScreen({result, onBack}) {
  const verdict = getVerdict(result.trust_score);
  const score = useCountUp(result.trust_score);
  const probability = useCountUp(result.phishing_probability * 100);
  const rows = Object.entries(result.features);


  return (
    
    <div className="results-page">
      <div className="results-panels">
        {/*Left Panel*/}
        <section className={`score-panel ${verdict.tone}`}>
          <div className="score-emoji">{verdict.emoji}</div>
          <div className="score-number">
            {Math.round(score)}
            <span>/100</span>
          </div>
          <div className="score-bar">
            <div className="score-bar-fill" style={{ width: `${score}%`}}/>
          </div>
          <p className="score-verdict">{verdict.text}</p>
          <button className="back-button" onClick={onBack}>Check another URL</button>
        </section>


        {/*Right Panel*/}
        <section className="details-panel">
          <h2>Details</h2>
          <p className="analysed-url">{result.url}</p>
          <ul className="details-list">
            <li style={{ animationDelay: "0.5s"}}>
              <span className="detail-label">Phishing probability</span>
              <span className="detail-value">{probability.toFixed(1)}%</span>
            </li>
            {rows.map(([key, value], i) => (
              <li key={key} style={{ animationDelay: `${0.65 + i * 0.12}s` }}>
                <span className="detail-label">{FEATURE_LABELS[key] ?? key}</span>
                <span className="detail-value">{renderValue(key, value)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="disclaimer">AI can make mistakes. Check with other sources.</p>
    </div>
  );
}


function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleCheck = async () => {
    // stop here if the input doesn't look like a url
    if (!looksLikeUrl(url)) {
      setError("Please enter a valid URL, e.g. example.com");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);


    try {
      const response = await axios.post("http://localhost:8000/check", { url: url.trim() });
      setResult(response.data);
    }
    catch(err)
    {
      setError("Could not reach the detector. Is the backend running?")
    }
    finally
    {
      setLoading(false);
    }
  };


  const handleBack = () => {
    setResult(null);
    setUrl("");
    setError("");
  };


  // Results replace the home screen
  if(result) {
    return <ResultScreen result={result} onBack={handleBack} />;
  }


  // Home screen
  return (
    <> 
      <h1>Phishing URL Detector</h1> {/*page heading*/}
      {/*box showing offline detection*/}
      <div className="offline-detection">
        <img src="/images/OfflineIcon.svg" alt="logo icon" />
        <h2>Offline Detection</h2>
        </div>
      {/*url input and search box*/}
      <div className="search-box">
        <div className="search-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            placeholder="Enter URL..." />
          <button onClick={handleCheck} disabled={loading}>
            {loading ? "Checking..." : <img src="/images/SearchIcon.svg" alt="" />}
          </button>
        </div>


        <p>AI can make mistakes. Check with other sources.</p>
      </div>


      {error && <p className="error">{error}</p>}
    </>
  );
}


export default Home;