import { useState } from "react";

const SAMPLES = { //dangerous, suspicious or safe
  danger: {
    label: "Dangerous",
    url: "virfy-paypaly.com",
    trust: 19,
    probability: 80.9,
    emoji: "💀",
    verdict: "Likely Phishing",
    tone: "danger",
    note: "20 or below. The model is confident this URL is phishing.",
    values: { url_length: 13, hostname_length: 13, num_dots: 1, num_hyphens: 0, num_digits: 0, has_ip_host: false, has_at_symbol: false },
  },
  warning: {
    label: "Suspicious",
    url: "w.com",
    trust: 49,
    probability: 50.8,
    emoji: "❓",
    verdict: "Suspicious",
    tone: "warning",
    note: "Under 50 but above 20. The model can't be sure, so be careful.",
    values: { url_length: 5, hostname_length: 5, num_dots: 1, num_hyphens: 0, num_digits: 0, has_ip_host: false, has_at_symbol: false },
  },
  safe: {
    label: "Safe",
    url: "example.com",
    trust: 90,
    probability: 10.0,
    emoji: "✅",
    verdict: "Looks safe",
    tone: "safe",
    note: "50 or above. Nothing about the URL looks like phishing.",
    values: { url_length: 11, hostname_length: 11, num_dots: 1, num_hyphens: 0, num_digits: 0, has_ip_host: false, has_at_symbol: false },
  },
};

const FEATURES = [
  { key: "url_length", label: "URL length", text: "Phishing links are often long, to hide where they really go." },
  { key: "hostname_length", label: "Hostname length", text: "The hostname is the domain part (like w.com). Very long hostnames are a common phishing sign." },
  { key: "num_dots", label: "Number of dots", text: "Lots of dots mean lots of subdomains, like paypal.login.secure.example.com, which can imitate a trusted site." },
  { key: "num_hyphens", label: "Number of hyphens", text: "Fake domains often use hyphens (-) to look real, like secure-bank-login.com." },
  { key: "num_digits", label: "Number of digits", text: "Many digits can mean an auto-generated or disguised address." },
  { key: "has_ip_host", label: "IP address as host", text: "Real sites rarely use a raw IP address (like 192.168.1.1) instead of a name. 'No' is the good answer." },
  { key: "has_at_symbol", label: "Contains @ symbol", text: "An @ in a URL can hide the real destination, because browsers ignore what comes before it. 'No' is the good answer." },
];

function HowItWorks() {
  const [choice, setChoice] = useState("warning");
  const s = SAMPLES[choice];

  return (
    <>
      <h1>How Phisher Works</h1> {/*page heading*/}
      <p className="how-intro">
        Pick an example result below to see how each part is explained.
      </p>

      {/*example picker*/}
      <div className="how-picker">
        {Object.entries(SAMPLES).map(([key, sample]) => (
          <button
            key={key}
            className={`how-pick ${key} ${choice === key ? "active" : ""}`}
            onClick={() => setChoice(key)}
          >
            {sample.emoji} {sample.label}
          </button>
        ))}
      </div>

      {/*score section*/}
      <div className="how-row">
        <section className={`score-panel ${s.tone}`}>
          <div className="score-emoji">{s.emoji}</div>
          <div className="score-number">
            {s.trust}
            <span>/100</span>
          </div>
          <div className="score-bar">
            <div className="score-bar-fill" style={{ width: `${s.trust}%` }} />
          </div>
          <p className="score-verdict">{s.verdict}</p>
        </section>

        <div className="how-explain">
          <div className="how-note">
            <h3>Example URL</h3>
            <p>{s.url}</p>
          </div>
          <div className="how-note">
            <h3>Trust Score</h3>
            <p>A score out of 100. The higher it is, the safer the URL looks.</p>
          </div>
          <div className="how-note">
            <h3>Verdict: {s.verdict}</h3>
            <p>{s.note}</p>
          </div>
        </div>
      </div>

      {/*details section*/}
      <h2 className="how-heading">Details</h2>
      <ul className="how-list">
        <li>
          <div className="how-list-top">
            <span className="detail-label">Phishing probability</span>
            <span className="detail-value">{s.probability.toFixed(1)}%</span>
          </div>
          <p className="how-list-text">How confident that the URL is phishing. Around 50% means it cannot be sure of either.</p>
        </li>
        {FEATURES.map((f) => {
          const v = s.values[f.key];
          const isFlag = f.key.startsWith("has_");
          return (
            <li key={f.key}>
              <div className="how-list-top">
                <span className="detail-label">{f.label}</span>
                <span className={`detail-value ${isFlag ? (v ? "value-bad" : "value-good") : ""}`}>
                  {isFlag ? (v ? "Yes" : "No") : v}
                </span>
              </div>
              <p className="how-list-text">{f.text}</p>
            </li>
          );
        })}
      </ul>

      <p className="disclaimer">AI can make mistakes. Check with other sources.</p>
    </>
  );
}

export default HowItWorks;