import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import AuthRoutes from "./routes/AuthRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import {Server} from "socket.io";

dotenv.config()

const app = express()

app.use(cors());
app.use(express.json());

app.use("/uploads/recordings/", express.static("uploads/recordings"));
app.use("/uploads/images/", express.static("uploads/images"));

app.use("/api/auth" , AuthRoutes);
app.use("/api/messages" , MessageRoutes);

const server = app.listen(process.env.PORT , ()=>{
    console.log(`Server started on port ${process.env.PORT}`);
});

//socket.io 

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Frontend URL
    },
});

// Global map for online users
global.onlineUsers = new Map();

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Add user to the onlineUsers map
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
        socket.broadcast.emit("online-users" , {
            onlineUsers: Array.from(onlineUsers.keys()),
        })
    });

    socket.on("signout", (id)=>{
        onlineUsers.delete(id);
        socket.broadcast.emit("online-users" , {
            onlineUsers: Array.from(onlineUsers.keys()),
        })
    })
    // Handle message sending
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to); // Get the recipient's socket ID
        if (sendUserSocket) {
            io.to(sendUserSocket).emit("msg-receive", {
                from: data.from,
                message: data.message,
            });
        }
    });

    // voice call
    socket.on("outgoing-voice-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("incoming-voice-call", {
                from: data.from,
                roomId : data.roomId,
                callType: data.callType,
            })
        }
    });

    // video call
    socket.on("outgoing-video-call", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("incoming-video-call", {
                from: data.from,
                roomId : data.roomId,
                callType: data.callType,
            })
        }
    });

    //reject voice - video call
    socket.on("reject-voice-call" , (data) => {
        const sendUserSocket = onlineUsers.get(data.from);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("voice-call-rejected");
        }
    });

    socket.on("reject-video-call" , (data) => {
        const sendUserSocket = onlineUsers.get(data.from);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("video-call-rejected");
        }
    });

     

    //accept incoming call
    socket.on("accept-incoming-call", ({id})=>{
        const sendUserSocket = onlineUsers.get(id);
        socket.to(sendUserSocket).emit("accept-call");
    })
});