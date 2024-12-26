import axios from "axios";

// Depending on whether we are rendering our application in the server (kubernetes cluster) or
// in the client (browser), we are creating a different copy of axios
// IMPORTANT: Everytime we fetch data, we first run this buildClient function
// in other words, for every getInitialProps, we use this to get the current client
// correctly connected to either ingress inginx, or just the client base url
const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server
    return axios.create({
      baseURL: "http://www.hartibusiness.com",
      headers: req.headers,
    });
  } else {
    // We must be on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
