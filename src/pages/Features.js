import { useState } from "react";

function About() {
//store the url and result in state variables
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
//runs when search button is clicked, sends to backend

  return (
    <> 
      <h1>Features</h1> {/*page heading*/}
    </>
  );
}

export default About;
function Features() {    
  return (                 
    <>                     
      <h1>Features</h1>
    </>                    
  );                       
}                          
                                                    
export default Features; 
