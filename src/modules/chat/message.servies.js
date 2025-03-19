
import mongoose from "mongoose";
import { chat } from "../../database/models/chat.model.js";
import { connect_users } from "./socket.services.js";
import { socket_auth } from "../../midelware/authantcation.js";

export const sendmessage=(socket) => {

    socket.on("sendMessage", async(messaginfo) => {
        const {message}=messaginfo
        const data = await socket_auth(socket.handshake.auth.authorization);
        if (data.statuscode !== "200") {
            socket.emit("authError", data.message);
            socket.disconnect(); 
            return;
        }
           let Chat= await chat.findOne({
                   $or: [
                       { mainUser: data.user._id, subParticipant:messaginfo.destId },
                       { mainUser: messaginfo.destId, subParticipant: data.user._id}
                   ]
               }).populate([{path:"mainUser"},{path:"subParticipant"},{path:"messages.senderId"}])
               if (!Chat) {
                 Chat = await chat.create({
                    mainUser: data.user._id,
                    subParticipant: messaginfo.destId, 
                    messages: []
                });
    
               
            }
            Chat?.messages.push({ senderId: data.user._id, message });
            await Chat.save();
           await socket.emit('successMessage', { Chat, message })
           await socket.to(connect_users.get(messaginfo.destId)).emit("receiveMessage", { message })
    });     
}


