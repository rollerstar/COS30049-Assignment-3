// Home.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";

//adds https if url has no scheme and removes space from the end
function normaliseUrl(value) {
  const trimmed = value.trim();
//checks if text starts with http:// and adds it if not
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

//checks if looks like host
function looksLikeUrl(value) {
  const trimmed = value.trim();
//returns false if input contains space/is empty
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
//adds https if missing then splits url
    const parsed = new URL(normaliseUrl(trimmed));
    return parsed.hostname.includes(".") || parsed.hostname.includes(":");
  } catch {
//text not parsed as url
    return false;
  }
}

function Home() {
 //what user types
  const [url, setUrl] = useState("");
  //reults set to null until theres one
  const [result, setResult] = useState(null);
  //message when invalid
  const [error, setError] = useState("");
  //switch to results page
  const navigate = useNavigate();

 //runs when search button is clicked, sends to backend
  const handleCheck = async () => {
  //stops and shows errors if not url or empty
    if (!url.trim()) {
      setResult(null);
      setError("Please enter a valid URL.");
      return;
    }
    if (!looksLikeUrl(url)) {
      setResult(null);
      setError("Invalid URL. Example: example.com/page");
      return;
    }
    setError("");
    //sends url to results hidden in state not address bar
    navigate("/results" , { state: { url: url.trim() } });
  };

  return (
    <>
      <h1>Phishing URL Detector</h1> {/*page heading*/}
      {/*box showing offline detection*/}
      <div className="offline-detection">
        <img src="/images/OfflineIcon.svg" alt="Offline Detection"/>
        <h2>Offline Detection</h2>
        </div>
      {/*url input and search box*/}
      <div className="search-box">
        <input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(""); //clear the error when typing starts
          }}
          onKeyDown={(e) => { //when enter key is pressed it processes
            if (e.key === "Enter") handleCheck(); //enter runs the search
          }}
          placeholder="Enter URL..."
        />
        <button onClick={handleCheck}>
          Search
            <img src="/images/SearchIcon.svg" alt="Search" />
        </button>
      </div>
      {/*error message for invalid input*/}
      {error && <p role="alert" className="error-message">{error}</p>} 
    </>
  );
}
export default Home;