import { useEffect, useRef, useState, useContext } from "react";
import Peer from "simple-peer/simplepeer.min.js";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";
import { Phone, PhoneOff } from "lucide-react";

const VideoCall = ({ onEndCall }) => {
  const { socket, authUser } = useContext(AuthContext);
  const { selectedUser } = useContext(ChatContext);

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  // STUN Servers allow devices to find each other over different networks (Mobile vs PC)
  const iceConfig = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  useEffect(() => {
    // 1. Get Camera and Microphone access
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) myVideo.current.srcObject = currentStream;
      })
      .catch((err) => console.error("Media Error:", err));

    // 2. Listen for Incoming Calls
    socket.on("incomingCall", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    // 3. Listen for Call Ending from the other side
    socket.on("callEnded", () => {
      leaveCall();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
    };
  }, [socket]);

  // --- Start a Call ---
  const callUser = (id) => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
      config: iceConfig,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data,
        from: authUser._id,
        name: authUser.fullName,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  // --- Answer an Incoming Call ---
  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
      config: iceConfig,
    });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (remoteStream) => {
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  // --- End Call & Cleanup ---
  const leaveCall = () => {
    // 1. Stop all camera/mic tracks so the light goes off
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    // 2. Destroy the P2P connection
    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    // 3. Notify parent to close overlay
    if (onEndCall) onEndCall();

    // 4. Reload to ensure a clean state (optional)
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-950 p-4 text-white">
      {/* Video Screens Section */}
      <div className="relative w-full max-w-2xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
        {/* Remote Video (Full Screen) */}
        {callAccepted ? (
          <video
            playsInline
            ref={userVideo}
            autoPlay
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-500 animate-pulse">
            {receivingCall ? "Incoming Call..." : "Waiting for connection..."}
          </div>
        )}

        {/* Local Video (Small Thumbnail) */}
        {stream && (
          <div className="absolute bottom-4 right-4 w-32 md:w-48 aspect-video rounded-lg overflow-hidden border-2 border-zinc-700 shadow-xl z-10">
            <video
              playsInline
              muted
              ref={myVideo}
              autoPlay
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls Section */}
      <div className="mt-8 flex items-center gap-6">
        {receivingCall && !callAccepted ? (
          <button
            onClick={answerCall}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-full transition-all scale-110"
          >
            <Phone className="w-5 h-5" /> Answer Call
          </button>
        ) : !callAccepted ? (
          <button
            onClick={() => callUser(selectedUser._id)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-full transition-all"
          >
            <Phone className="w-5 h-5" /> Start Video Call
          </button>
        ) : null}

        <button
          onClick={leaveCall}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full transition-all"
        >
          <PhoneOff className="w-5 h-5" /> End Call
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
