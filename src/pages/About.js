import { useState } from "react";

function About() {
//store the url and result in state variables
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
//runs when search button is clicked, sends to backend

  return (
    <> 
      <h1>About</h1> {/*page heading*/}
      {result && <p>Result: {result}</p>}
    </>
  );
}

export default About;