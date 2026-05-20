import axios from "axios";

const API = "http://localhost:8080/api/auth";

export const registerEmployee = (data) => {
  return axios.post(`${API}/register`, data);
};
