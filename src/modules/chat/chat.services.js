import mongoose from "mongoose";
import { chat } from "../../database/models/chat.model.js";
import { error_handeling } from "../../utils/error_handeling.js";

//-----------------------------------------------------send message to friend.----------------------------------------------------------
export const find_chat = error_handeling(async (req, res, next) => {
    const { userId } = req.params;
    // Find existing chat
    let Chat = await chat.findOne({
        $or: [
            { mainUser: req.user._id, subParticipant: userId },
            { mainUser: userId, subParticipant: req.user._id }
        ]
    }).populate([{path:"mainUser"},{path:"messages.senderId"},{path:"subParticipant"}])
   

    return res.status(200).json({  chat: Chat});
});

