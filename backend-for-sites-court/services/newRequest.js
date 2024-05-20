import axios from "axios";
import 'dotenv/config'
const newRequest = axios.create({
  baseURL:`${process.env.API_URL}`,
  withCredentials: true,
  timeout:5000, 
  headers: {
    "Authorization":`${process.env.TOKEN_ESIM}`,
  }
});

newRequest.interceptors.response.use(
  response => response,
  error => {
      if (error.code === 'ERR_NETWORK') {
          return Promise.reject({
            response : {
              data : {
                error:"Server API currently do not working!"
              }
            }
          })
      }


      return Promise.reject(error)
  }
)


export default newRequest;