import { EventEmitter } from 'events';
import { customAlphabet} from 'nanoid'
import { sendemail } from './send email .js';
import { user } from '../../database/models/user.model.js';
import { email_template } from './html.js';
import bcrypt from 'bcrypt';
export const eventEmitter = new EventEmitter();
eventEmitter.on('sendemail',async(data) => {   
const otp=customAlphabet('123456789',4)()  
if(!(sendemail(data.email,email_template("Verify Email address",otp)))){
    return next(new Error("ERROR will send email"))
}const email=data.email
const otpEmail= await bcrypt.hash(otp,+process.env.SECRET_KEY )
await user.updateOne({email},{otpEmail})
})
//forget password
eventEmitter.on('forget_password',async(data) => {
const otppassword=customAlphabet('123456789',4)()
if(!(sendemail(data.email,email_template("forget password",otppassword)))){
    
    return next(new Error("ERROR will send email"))
}const email=data.email
const hashotppassword=await bcrypt.hash(otppassword,+process.env.SECRET_KEY )

await user.updateOne({email},{otppassword:hashotppassword})
})
//when change email
eventEmitter.on('confirmation',async(data) => {
     const otpoldEmail=customAlphabet('123456789',4)()
     console.log(otpoldEmail)
    if(!(sendemail(data.email,email_template("change_email",otpoldEmail)))){
        return next(new Error("ERROR will send email"))
    }
    const email=data.email
    const hashold_email=await bcrypt.hash(otpoldEmail,+process.env.SECRET_KEY )
    
    await user.updateOne({email},{otp_oldemail:hashold_email})
    })

    eventEmitter.on('confirmation_new',async(data) => {
    const otpnewemail=customAlphabet('123456789',4)()
    console.log(otpnewemail)
       if(!(sendemail(data.email,email_template("change_email",otpnewemail)))){
           return next(new Error("ERROR will send email"))
       }const email=data.email
       const hashnew_email=await bcrypt.hash(otpnewemail,+process.env.SECRET_KEY )
       
       await user.updateOne({temp_email:email},{otp_newemail:hashnew_email})
       })

    