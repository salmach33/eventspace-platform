import { createContext, useContext, useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "../services/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  const login = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    connectSocket(userData.token);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    disconnectSocket();
  };

  useEffect(() => {
    if (user?.token) connectSocket(user.token);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
