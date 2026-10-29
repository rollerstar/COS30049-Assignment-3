import { useState } from "react";
const FACTS = [
  { title: "What it does", text: "Phisher checks a URL and gives it a trust score out of 100. The lower the score, the more likely the link is phishing." },
  { title: "How it decides", text: "The URL is broken down into simple features, like its length and the number of dots, hyphens and digits. A machine learning model then turns those features into a phishing probability." },
  { title: "What it learned from", text: "The model was trained on labelled lists of phishing and benign URLs (the malicious_phish and seirin16_phish datasets)." },
  { title: "Offline detection", text: "Everything runs on your own machine. The URL is never sent to a third-party service." },
];

function About() {
  return (
    <>
      <h1>About</h1> {/*page heading*/}
      <p className="about-intro">
        Phisher is a phishing URL detector built for COS30049 by Jade, Nathan and Sam.
      </p>

      <div className="about-list">
        {FACTS.map((f) => (
          <section key={f.title} className="about-card">
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </section>
        ))}
      </div>

      <p className="disclaimer">AI can make mistakes. Check with other sources.</p>
    </>
  );
}

export default About;