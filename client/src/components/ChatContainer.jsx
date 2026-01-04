import React, { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import VideoCall from "./VideoCall";
import { Video, SendHorizontal, MessageCircle } from "lucide-react";

import Swal from "sweetalert2";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages,
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
    deleteMessage,
  } = useContext(ChatContext);

  const { authUser, onlineUsers } = useContext(AuthContext);
  const scrollEnd = useRef();
  const [input, setInput] = useState("");
  const [isCalling, setIsCalling] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    await sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleDeleteMessage = async (messageId) => {
    const result = await Swal.fire({
      title: "Delete Message?",
      text: "This will remove the message for everyone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      background: "#1f2937",
      color: "#fff",
    });

    if (result.isConfirmed) {
      await deleteMessage(messageId);
      Swal.fire("Deleted!", "The message has been removed.", "success");
    }
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // --- Effects ---
  useEffect(() => {
    if (selectedUser) getMessages(selectedUser._id);
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-500 bg-white/10 max-md:hidden">
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
            size={92}
            style={{ stroke: "url(#indigo-gradient)" }}
          />
        </div>
        <p className="text-lg font-medium text-white">
          Choose a person to start the chat
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden backdrop-blur-lg">
      {isCalling && (
        <div className="absolute inset-0 z-[100] bg-black">
          <VideoCall onEndCall={() => setIsCalling(false)} />
        </div>
      )}

      <div className="flex items-center gap-3 py-3 px-4 border-b border-stone-500 shrink-0">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex-1">
          <p className="text-lg text-white flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900"></span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsCalling(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <Video className="w-6 h-6  text-indigo-500" />
          </button>

          <img
            onClick={() => setSelectedUser(null)}
            src={assets.arrow_icon}
            alt="Back"
            className="w-7 cursor-pointer"
          />
        </div>
      </div>

      {/* --- Chat Area --- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`flex items-end gap-2 ${
              msg.senderId === authUser._id ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div className="flex flex-col items-center shrink-0">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            <div
              className="max-w-[70%] group relative"
              onDoubleClick={() => handleDeleteMessage(msg._id)}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt="attachment"
                  className="rounded-lg border border-gray-700 max-h-60 object-cover"
                />
              ) : (
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    msg.senderId === authUser._id
                      ? "bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-tr-none"
                      : "bg-zinc-800 text-zinc-100 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              )}
              <p className="text-[10px] text-zinc-500 mt-1">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd} />
      </div>

      {/* --- Bottom Input Area --- */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 bg-transparent shrink-0"
      >
        <div className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-2xl border border-white/5">
          <label
            htmlFor="image"
            className="cursor-pointer p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <img src={assets.gallery_icon} alt="Gallery" className="w-5" />
            <input
              onChange={handleSendImage}
              type="file"
              id="image"
              accept="image/*"
              hidden
            />
          </label>

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2"
          />

          <button
            type="submit"
            className="p-2 hover:scale-105 transition-transform"
          >
            <svg width="0" height="0">
              <linearGradient
                id="ali-chat-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop stopColor="#6366f1" offset="0%" />
                <stop stopColor="#312e81" offset="100%" />
              </linearGradient>
            </svg>
            <SendHorizontal
              className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 cursor-pointer transition-opacity"
              style={{ stroke: "url(#ali-chat-gradient)" }}
              strokeWidth={2.5}
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;
