import { dbconnection } from "./database/db connection.js"
import { post_routes } from "./modules/post/post.controller.js";
import { user_routes } from "./modules/user/user.controller.js"
import 'dotenv/config';
import cors from "cors";
import { rateLimit } from 'express-rate-limit'
import { socket } from "./modules/chat/socket.services.js";
import { chat_routes } from "./modules/chat/chat.controller.js";

const limiter = rateLimit({
	windowMs: 60 * 1000, // 1 minutes
	limit: 20, // Limit each IP to 5 requests per minute.
	message:"Please wait and try again after 1 minute"
})
export const bootstrap=(app,express) => {
  app.use(cors())
    //db connection
     dbconnection()
     socket()
    //json
    app.use(express.json())
    app.use(limiter)

    
    //main router
    app.get('/', (req, res) => res.send('Hello'))
    
    //app routers
    app.use('/user',user_routes)
    app.use('/post',post_routes)
    app.use('/chat',chat_routes)
   // app.use("/uploads",express.static(path.resolve("uploads")) )   if upload locally
    
    app.use("*",(req,res,next) => {
       next(new Error("page not found"))

    })
    
    //global error_handeling
    app.use((error,req,res,next) => {
      return process.env.mode=="dev"? res.status('404').json({errormessage:error.message,stack:error.stack}):res.status('404').json({errormessage:error.message})
     })


 }

