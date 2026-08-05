const LOCAL_API_URL = "http://localhost:3000";
const ENV_API_URL = import.meta.env.VITE_API_URL;

const isLocalHost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const API_URL = isLocalHost ? LOCAL_API_URL : ENV_API_URL || LOCAL_API_URL;
export default API_URL;
