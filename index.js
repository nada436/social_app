import express from 'express';
import { bootstrap } from './src/app.controller.js';
import http from "http";
import { Server } from "socket.io";
import { socket } from './src/modules/chat/socket.services.js';

const app = express();
const port = process.env.PORT || 3000;
export const server = app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
bootstrap(app, express);



