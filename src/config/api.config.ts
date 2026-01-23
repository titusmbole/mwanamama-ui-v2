// API Configuration
// Switch between development and production base URLs

const isDevelopment = import.meta.env.DEV;

export const BASE_URL = isDevelopment 
  ? "http://localhost:4850/api/v1" 
  : "https://api.mwanamama.org/api/v1";


export const SOCKET_BASE_URL = isDevelopment
  ? "http://localhost:4850/ws"
  : "https://api.mwanamama.org/ws";
