import API from "./api";

// Register
export const registerUser = async ({ name, email, password }) => {
  const res = await API.post("/auth/register", { name, email, password });
  localStorage.setItem("token", res.data.token); 
  return res.data;
};

// Login
export const loginUser = async ({ email, password }) => {
  const res = await API.post("/auth/login", { email, password });
  localStorage.setItem("token", res.data.token); 
  return res.data;
};

// Logout
export const logoutUser = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
