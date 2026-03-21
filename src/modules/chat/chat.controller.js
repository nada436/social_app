import { Router } from "express";
import { authentication } from "../../middleware/authentication.js";
import { find_chat } from "./chat.services.js";
export const chat_routes=Router()
chat_routes.get("/:userId", authentication, find_chat);
