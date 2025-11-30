import { Link } from 'react-router-dom';
import Navbar from '../components/navbar';


function About() {
  return (
    <div className="container-fluid mt-3 px-4">
      <Navbar />
      <h1>About AccessibleLOD</h1> 
      <p>
       AccessibleLOD is an open-source project aimed at creating the Accessible Linked Open Data (sub)cloud. For each resource indexed within the cloud it is possible to view its Accessibility score and the main information contained in the dataset metadata such as: description, license, SPARQL endpoint and Data Dump. 
      </p>
{/*         <p>
         The project is developed by Maria Angela Pellegrino, Gabriele Tuozzo and Eleni Ilkou.
         The research article describing the theoretical framework used to compute the accessibility score and select the dataset from the LOD cloud to include is currently under review.
      </p>
      <h2>Contact Us</h2>
      <p>
        For any inquiries or support, please contact us at <a href="mailto:gtuozzo@unisa.it">gtuozzo@unisa.it</a>
      </p> */}
    </div>
  );
}

export default About;