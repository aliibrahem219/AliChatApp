import React, { useContext, useState } from "react";
import assets from "../assets/assets.js";
import { MessageCircle } from "lucide-react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
  const navigate = useNavigate();
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const { login } = useContext(AuthContext);
  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (currState === "Sign Up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }
    login(currState === "Sign Up" ? "signup" : "login", {
      fullName,
      email,
      password,
      bio,
    });
  };
  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl ">
      <div className="flex items-center gap-2 absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer">
        <div className="flex items-center gap-2">
          <svg width="0" height="0">
            <linearGradient
              id="indigo-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop stopColor="#6366f1" offset="0%" />
              <stop stopColor="#312e81" offset="100%" />
            </linearGradient>
          </svg>

          <MessageCircle
            size={32}
            style={{ stroke: "url(#indigo-gradient)" }}
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-indigo-900 bg-clip-text text-transparent">
            AliChat
          </span>
        </div>
      </div>
      <div className="bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-white text-center mb-3">
          {currState === "Sign Up" ? "Create account " : "Login"}
        </h2>
        <p className="text-center text-sm mb-6">
          {currState === "Sign Up"
            ? "Create your account "
            : "Login to your account!"}
        </p>
        <form onSubmit={onSubmitHandler}>
          {currState === "Sign Up" && !isDataSubmitted && (
            <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
              <img src={assets.person_icon} alt="" />
              <input
                onChange={(e) => {
                  setFullName(e.target.value);
                }}
                value={fullName}
                className="bg-transparent outline-none text-white"
                type="text"
                placeholder="Full Name"
                required
              />
            </div>
          )}
          {!isDataSubmitted && (
            <>
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.mail_icon} alt="" />
                <input
                  className="bg-transparent outline-none text-white"
                  type="email"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  value={email}
                  placeholder="Email id"
                  required
                />
              </div>
              <div className="mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]">
                <img src={assets.lock_icon} alt="" />
                <input
                  className="bg-transparent outline-none text-white"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  value={password}
                  type="password"
                  placeholder="Password"
                  required
                />
              </div>
            </>
          )}
          {currState && isDataSubmitted && (
            <textarea
              onChange={(e) => setBio(e.target.value)}
              value={bio}
              rows={4}
              className="p-2 w-full px-5 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="provide a short bio ..."
              required
            >
              {" "}
            </textarea>
          )}
          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-indigo-500 cursor-pointer"
          >
            Forgot password ?
          </p>
          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium">
            {currState}
          </button>
        </form>

        {currState === "Sign Up" ? (
          <p className="text-gray-400 text-center text-xs mt-4">
            Alerady have an account ?{" "}
            <span
              onClick={() => {
                setCurrState("Login");
              }}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account ?{" "}
            <span
              onClick={() => {
                setCurrState("Sign Up");
              }}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
