import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;
export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null); // Check if user is authenticted and if so , set the user data and connect the socket

  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to checkauth");
    }
  }; // Login function to handle user authenticaton and socket connection
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        connectSocket(data.userData);
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to login");
    }
  }; // Logout function to handle user logout and socket disconnection
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("logged out successfully");
    socket.disconnect();
  }; //Update profile function to handle user profile updates

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  }; // function to delete messages
  const deleteProfile = async () => {
    try {
      const { data } = await axios.delete(`/api/auth/delete-profile`);
      if (data.success) {
        toast.success("Profile deleted");
        logout();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete profile");
    }
  };
  const sendVerificationOtp = async () => {
    try {
      const { data } = await axios.post(
        "/api/auth/send-verify-otp",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send verification otp"
      );
    }
  };
  const verifyEmail = async (otp) => {
    try {
      const { data } = await axios.post(
        "/api/auth/verify-account",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to verify email");
    }
  };
  const sendResetOtp = async ({ email, setIsEmailSent }) => {
    try {
      const { data } = await axios.post("/api/auth/send-reset-otp", {
        email,
      });

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset otp");
    }
  };
  const resetPassword = async ({ email, otp, newPassword }) => {
    try {
      const { data } = await axios.post("/api/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    }
  };
  //////////////////

  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(
      backendUrl,
      { withCredentials: true },
      {
        query: {
          userId: userData._id,
        },
      }
    );
    newSocket.connect();
    setSocket(newSocket);
    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });
  };
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
    }
    checkAuth();
  }, []);
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem("token");

      if (savedToken) {
        axios.defaults.headers.common["token"] = savedToken;
        setToken(savedToken);
        await checkAuth();
      }
    };

    initializeAuth();
  }, []);
  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    backendUrl,
    sendVerificationOtp,
    verifyEmail,
    deleteProfile,
    sendResetOtp,
    resetPassword,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
