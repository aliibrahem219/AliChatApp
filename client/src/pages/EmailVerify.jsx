import React, { useContext } from "react";
import { MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const EmailVerify = () => {
  const { verifyEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const inputRefs = React.useRef([]);
  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };
  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text");
    const patseArray = paste.split("");
    patseArray.forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // 1. Join the values from the 6 inputs into one string
      const otpArray = inputRefs.current.map((input) => input.value);
      const otp = otpArray.join("");

      if (otp.length < 6) {
        return toast.error("Please enter all 6 digits");
      }

      // 2. Call the context function
      await verifyEmail(otp);
    } catch (error) {
      toast.error("An error occurred during verification" + error);
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen  bg-gradient-to-br from-blue-200 to-purple-400">
      <div
        onClick={() => {
          navigate("/");
        }}
        className="flex items-center gap-2 absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer"
      >
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
      <form
        onSubmit={onSubmitHandler}
        className="bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm"
      >
        <h1 className="text-white text-2xl font-semibold text-center mb-4">
          Email Verify OTP
        </h1>
        <p className="text-center mb-6 text-indigo-300">
          Enter the 6-digit code sent to your email id.
        </p>
        <div className="flex justify-between mb-8" onPaste={handlePaste}>
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                ref={(e) => (inputRefs.current[index] = e)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                required
                className="w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md"
              />
            ))}
        </div>
        <button className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full cursor-pointer">
          Verify Email
        </button>
      </form>
    </div>
  );
};

export default EmailVerify;
