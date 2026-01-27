// client/src/utils/auth.js

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const setAuth = (token, user) => {
  if (!token) return;

  // ✅ Store token
  localStorage.setItem(TOKEN_KEY, token);

  // ✅ Store full user object (single source of truth)
  if (user && typeof user === "object") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  // ✅ Backward compatibility (optional)
  if (user?.role) localStorage.setItem("role", user.role);
  if (user?.email) localStorage.setItem("email", user.email);

  const displayName =
    user?.name || user?.fullName || user?.email || "User";
  localStorage.setItem("name", displayName);
};

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  // remove legacy keys too
  localStorage.removeItem("role");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem(TOKEN_KEY);
};

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  // ✅ Prefer role from user object
  const user = getUser();
  if (user?.role) return user.role;

  // fallback legacy
  return localStorage.getItem("role");
};

export const getUserName = () => {
  const user = getUser();
  return (
    user?.name ||
    user?.fullName ||
    user?.email ||
    localStorage.getItem("name") ||
    "User"
  );
};

export const getUserEmail = () => {
  const user = getUser();
  return user?.email || localStorage.getItem("email") || "";
};
