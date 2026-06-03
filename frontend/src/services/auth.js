/**
 * Client authentication service for managing admin JWT tokens in LocalStorage.
 */

const TOKEN_KEY = "hindustan_admin_token";

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getPayload = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    removeToken(); // Clear malformed token
    return null;
  }
};

export const isAuthenticated = () => {
  const payload = getPayload();
  if (!payload) return false;
  
  // Check expiration (exp is in Unix seconds)
  const currentTime = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentTime) {
    removeToken();
    return false;
  }
  
  return payload.role === "admin";
};

export const getAdminName = () => {
  const payload = getPayload();
  return payload ? (payload.name || "Administrator") : "Administrator";
};

export const getAdminEmail = () => {
  const payload = getPayload();
  return payload ? payload.sub : "";
};
