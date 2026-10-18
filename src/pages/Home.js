import { useState } from "react";

function Home() {
//store the url and result in state variables
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
//runs when search button is clicked, sends to backend
  const handleCheck = async () => {
    // backend here <-----------------!!!! 
  };

  return (
    <> 
      <h1>Phishing URL Detector</h1> {/*page heading*/}
      {/*box showing offline detection*/}
      <div className="offline-detection">
        <img src="/images/OfflineIcon.svg" alt="" />
        <h2>Offline Detection</h2>
        </div>
      {/*url input and search box*/}
      <div className="search-box">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter URL..."
        />
        <button onClick={handleCheck}>Search</button>
      </div>
      {result && <p>Result: {result}</p>}
    </>
  );
}

export default Home;