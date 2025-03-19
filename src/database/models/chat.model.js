import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    mainUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subParticipant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    messages: [
      {
        message: { type: String, required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      }
    ]
  },
  { timestamps: true } // Automatically adds createdAt & updatedAt
);

export const chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);
