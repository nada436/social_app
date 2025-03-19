import { Router } from "express";
import { authantcation } from "../../midelware/authantcation.js";
import { find_chat } from "./chat.services.js";
export const chat_routes=Router()
chat_routes.get("/:userId", authantcation, find_chat);
