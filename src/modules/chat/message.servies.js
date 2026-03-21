
import mongoose from "mongoose";
import { chat } from "../../database/models/chat.model.js";
import { connect_users } from "./socket.services.js";
import { socket_auth } from "../../middleware/authentication.js";

export const sendmessage=(socket) => {

    socket.on("sendMessage", async(messageInfo) => {
        const {message}=messageInfo
        const data = await socket_auth(socket.handshake.auth.authorization);
        if (data.statuscode !== "200") {
            socket.emit("authError", data.message);
            socket.disconnect(); 
            return;
        }
           let Chat= await chat.findOne({
                   $or: [
                       { mainUser: data.user._id, subParticipant:messageInfo.destId },
                       { mainUser: messageInfo.destId, subParticipant: data.user._id}
                   ]
               }).populate([{path:"mainUser"},{path:"subParticipant"},{path:"messages.senderId"}])
               if (!Chat) {
                 Chat = await chat.create({
                    mainUser: data.user._id,
                    subParticipant: messageInfo.destId, 
                    messages: []
                });
    
               
            }
            Chat?.messages.push({ senderId: data.user._id, message });
            await Chat.save();
           await socket.emit('successMessage', { Chat, message })
           await socket.to(connect_users.get(messageInfo.destId)).emit("receiveMessage", { message })
    });     
}


