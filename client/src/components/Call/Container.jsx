import React, { useEffect, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { reducerCases } from "@/context/constants";
import { useStateProvider } from "@/context/StateContext";
import Image from "next/image";
import { MdOutlineCallEnd } from "react-icons/md";

function Container({ data }) {
  const [{ socket, userInfo }, dispatch] = useStateProvider();
  const [callAccepted, setCallAccepted] = useState(false);

  useEffect(() => {
    if (data.type === "out-going") {
      socket.current.on("accept-call", () => setCallAccepted(true));
    } else {
      setTimeout(() => {
        setCallAccepted(true);
      }, 1000);
    }
  }, [data]);

  

  const initializeCall = async () => {
    const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID;
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_ID;
    
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      data.roomId.toString(),
      userInfo.id,
      userInfo.name
    );

    

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    zp.joinRoom({
      container: document.querySelector("#video-call-container"),
      sharedLinks: [
        {
          name: 'Copy link',
          url: `${window.location.origin}/call/${data.roomId}`
        }
      ],
      scenario: {
        mode: data.callType === 'video' 
          ? ZegoUIKitPrebuilt.OneONoneCall 
          : ZegoUIKitPrebuilt.VoiceCall,
      },
      onLeaveRoom: () => {
        dispatch({ type: reducerCases.END_CALL });
        if (data.callType === "voice") {
          socket.current.emit("reject-voice-call", { from: data.id });
        } else {
          socket.current.emit("reject-video-call", { from: data.id });
        }
      },
      turnOnCameraWhenJoining: data.callType === 'video',
      turnOnMicrophoneWhenJoining: true,
    });
  };

  useEffect(() => {
    if (callAccepted) {
      initializeCall();
    }
  }, [callAccepted]);

  const endCall = () => {
    if (data.callType === "voice") {
      socket.current.emit("reject-voice-call", {
        from: data.id,
      });
    } else {
      socket.current.emit("reject-video-call", {
        from: data.id,
      });
    }
    dispatch({ type: reducerCases.END_CALL });
  };

  // If call is not accepted, show caller information
  if (!callAccepted) {
    return (
      <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
        <div className="flex flex-col gap-3 items-center">
          <span className="text-5xl">{data.name}</span>
          <span className="text-lg">
            {data.type === "out-going" ? "Calling" : "Incoming Call"}
          </span>
        </div>
        <div className="my-24">
          <Image
            src={data.profilePicture}
            alt="avatar"
            height={300}
            width={300}
            className="rounded-full"
          />
        </div>
      </div>
    );
  }

  // When call is accepted, show video call container
  return (
    <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
      <div id="video-call-container" style={{ width: '100%', height: '100%' }} />
      <div className="absolute bottom-5 h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
        <MdOutlineCallEnd onClick={endCall} className="text-3xl cursor-pointer" />
      </div>
    </div>
  );
}

export default Container;





// import { reducerCases } from "@/context/constants";
// import { useStateProvider } from "@/context/StateContext";
// import { GET_CALL_TOKEN } from "@/utils/ApiRoutes";
// import axios from "axios";
// import Image from "next/image";
// import React, { useEffect, useState } from "react";
// import { MdOutlineCallEnd } from "react-icons/md";

// function Container({ data }) {
//   const [{ socket, userInfo }, dispatch] = useStateProvider();
//   const [callAccepted, setCallAccepted] = useState(false);
//   const [token, setToken] = useState(undefined);
//   const [zgVar, setZgVar] = useState(undefined);
//   const [localStream, setLocalStream] = useState(undefined);
//   const [publishStream, setPublishStream] = useState(undefined);
//   const [statsInterval, setStatsInterval] = useState(null);

//   useEffect(() => {
//     if (data.type === "out-going") {
//       socket.current.on("accept-call", () => setCallAccepted(true));
//     } else {
//       setTimeout(() => {
//         setCallAccepted(true);
//       }, 1000);
//     }
//   }, [data]);

//   useEffect(() => {
//     const getToken = async () => {
//       try {
//         const {
//           data: { token: returnedToken },
//         } = await axios.get(`${GET_CALL_TOKEN}/${userInfo.id}`);
//         setToken(returnedToken);
//       } catch (err) {
//         console.log(err);
//       }
//     };
//     getToken();
//   }, [callAccepted]);

//   useEffect(() => {
//     const startCall = async () => {
//       import("zego-express-engine-webrtc").then(async ({ ZegoExpressEngine }) => {
//         const zg = new ZegoExpressEngine(
//           process.env.NEXT_PUBLIC_ZEGO_APP_ID,
//           process.env.NEXT_PUBLIC_ZEGO_SERVER_ID
//         );
//         setZgVar(zg);

//         zg.on(
//           "roomStreamUpdate",
//           async (roomId, updateType, streamList, extendedData) => {
//             if (updateType === "ADD") {
//               const rmVideo = document.getElementById("remote-video");
//               const vd = document.createElement(
//                 data.callType === "video" ? "video" : "audio"
//               );
//               vd.id = streamList[0].streamID;
//               vd.autoplay = true;
//               vd.playsInline = true;
//               vd.muted = false;
//               if (rmVideo) {
//                 rmVideo.appendChild(vd);
//               }
//               zg.startPlayingStream(streamList[0].streamID, {
//                 audio: true,
//                 video: true,
//               }).then((stream) => (vd.srcObject = stream));
//             } else if (
//               updateType === "DELETE" &&
//               zg &&
//               localStream &&
//               streamList[0].streamID
//             ) {
//               zg.destroyStream(localStream);
//               zg.stopPublishingStream(streamList[0].streamID);
//               zg.logoutRoom(data.roomId.toString());
//               dispatch({ type: reducerCases.END_CALL });
//             }
//           }
//         );

//         await zg.loginRoom(
//           data.roomId.toString(),
//           token,
//           { userID: userInfo.id, userName: userInfo.name },
//           { userUpdate: true }
//         );
//         const localStream = await zg.createStream({
//           camera: {
//             audio: true,
//             video: data.callType === "video" ? true : false,
//           },
//         });
//         setLocalStream(localStream);

//         // Attach the local stream to the local video element
//         const localVideo = document.getElementById("local-audio");
//         const videoElement = document.createElement(
//           data.callType === "video" ? "video" : "audio"
//         );
//         videoElement.id = "video-local-zego";
//         videoElement.className = "h-28 w-32";
//         videoElement.autoplay = true;
//         videoElement.muted = false;
//         videoElement.playsInline = true;
//         localVideo.appendChild(videoElement);
//         videoElement.srcObject = localStream;

//         // Start publishing the stream
//         const streamID = "69" + Date.now();
//         setPublishStream(streamID);
//         zg.startPublishingStream(streamID, localStream);

//         // Start collecting WebRTC stats
//         startCollectingStats(zg, localStream);
//       });
//     };
//     if (token) {
//       startCall();
//     }
//   }, [token]);

//   const startCollectingStats = (zg, stream) => {
//     const interval = setInterval(() => {
//       const audioTrack = stream.getAudioTracks()[0];
//       const videoTrack = stream.getVideoTracks()[0];

//       if (audioTrack) {
//         zg.getRTCStats(audioTrack).then((stats) => {
//           console.log("Audio Stats:", stats);
//         });
//       }

//       if (videoTrack) {
//         zg.getRTCStats(videoTrack).then((stats) => {
//           console.log("Video Stats:", stats);
//         });
//       }
//     }, 5000); // Collect stats every 5 seconds
//     setStatsInterval(interval);
//   };

//   const endCall = () => {
//     clearInterval(statsInterval); // Stop collecting stats
//     if (zgVar && localStream && publishStream) {
//       zgVar.destroyStream(localStream);
//       zgVar.stopPublishingStream(publishStream);
//       zgVar.logoutRoom(data.roomID.toString());
//     }
//     if (data.callType === "voice") {
//       socket.current.emit("reject-voice-call", {
//         from: data.id,
//       });
//     } else {
//       socket.current.emit("reject-video-call", {
//         from: data.id,
//       });
//     }
//     dispatch({ type: reducerCases.END_CALL });
//   };

//   return (
//     <div className="border-conversation-border border-1 w-full bg-conversation-panel-background flex flex-col h-[100vh] overflow-hidden items-center justify-center text-white">
//       <div className="flex flex-col gap-3 items-center">
//         <span className="text-5xl">{data.name}</span>
//         <span className="text-lg">
//           {callAccepted && data.callType !== "video" ? "On going call" : "Calling"}
//         </span>
//       </div>
//       {(!callAccepted || data.callType === "audio") && (
//         <div className="my-24">
//           <Image
//             src={data.profilePicture}
//             alt="avatar"
//             height={300}
//             width={300}
//             className="rounded-full"
//           />
//         </div>
//       )}
//       <div className="my-5 relative" id="remote-video">
//         <div className="absolute bottom-5 right-5" id="local-audio"></div>
//       </div>
//       <div className="h-16 w-16 bg-red-600 flex items-center justify-center rounded-full">
//         <MdOutlineCallEnd onClick={endCall} className="text-3xl cursor-pointer" />
//       </div>
//     </div>
//   );
// }

// export default Container;
 