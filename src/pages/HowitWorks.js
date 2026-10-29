import { useState } from "react";

function HowItWorks() {
//store the url and result in state variables
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
//runs when search button is clicked, sends to backend

  return (
    <> 
      <h1>How it Works</h1> {/*page heading*/}
    </>
  );
}

export default HowItWorks;
function HowItWorks() {
  return (
    <>
      <h1>How It Works</h1>
    </>
  );
}

export default HowItWorks;  
