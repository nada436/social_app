import { Server } from "socket.io";
import { server } from "../../../index.js";
import { socket_auth } from "../../midelware/authantcation.js";
import { sendmessage } from "./message.servies.js";


export const connect_users = new Map();

export const socket = () => {
    const io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", async (socket) => {
        console.log("A user connected:", socket.handshake.auth.authorization);

        // Authenticate user
        const data = await socket_auth(socket.handshake.auth.authorization);
        if (data.statuscode !== "200") {
            socket.emit("authError", data.message);
            socket.disconnect(); 
            return;
    }
        // Store user ID and socket ID
        connect_users.set(data.user._id.toString(), socket.id);
        console.log("Connected Users:", connect_users);

        await sendmessage(socket,data.user._id)
        // Handle disconnection
        socket.on("disconnect", () => {
            connect_users.delete(data.user._id);
            console.log("User Disconnected:", data.user._id);
        });
    });
};
