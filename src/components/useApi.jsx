import axios from 'axios'
import  { useEffect,useState } from 'react'

const baseURL = "https://wellpark.dd-long.fun/api/parks";

export default function UseApi() {
    const [error, setError] = useState(null)
    useEffect(() => {
        // invalid url will trigger an 404 error
        const getWellpark = async () =>{
          try {
            const response = await axios.get(baseURL);
            console.log(response.data);
          } catch (error) {
            setError(error);
          }
        }
      getWellpark();
      }, []);
      return error ? error.message : null;
}
