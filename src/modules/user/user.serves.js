import { customAlphabet} from 'nanoid'
import { user} from '../../database/models/user.model.js';
import { eventEmitter } from '../../utils/E-mail service/email event.js';
import { error_handeling } from './../../utils/error_handeling.js';
import {OAuth2Client} from 'google-auth-library';
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt';
import CryptoJS from 'crypto-js'
import { now } from 'mongoose';
import cloudinary from '../../cloudinary/index.js';
import { authantcation_types, decoded } from '../../midelware/authantcation.js';
import { post } from '../../database/models/post.model.js';
import { comment } from '../../database/models/comment.model.js';






//---------------------------------------------sign up with system-------------------------------------------------------------------------
export const sign_up=error_handeling(async(req,res,next) => {
    const{name,email,password,phone,gender}=req.body
   const new_user=await user.findOne({email})
   if(new_user){

       return next(new Error("email already exist"))
    }

    //insert data
     
     const hashpassword= await bcrypt.hash(password,+process.env.SECRET_KEY )
     const hashphone= await CryptoJS.AES.encrypt(phone, process.env.SECRET_KEY).toString();
     const user_no=customAlphabet('123456789',4)()
    //upload coverimage
    
    const coverImage = req.files['coverimage'][0];
    const { public_id, secure_url } = await cloudinary.uploader.upload(coverImage.path, { folder: `social_app/users/${user_no}/coverimage` });

    // upload images
    const arr_of_files = [];
    for (const file of req.files['images']) {
      const { public_id, secure_url } = await cloudinary.uploader.upload(file.path, { folder: `social_app/users/${user_no}/images` });
      arr_of_files.push({ public_id, secure_url });
    }

     await user.create({name,email,password:hashpassword,phone:hashphone,gender,provider:'system',coverimage:{public_id,secure_url},images:arr_of_files,user_no})
    
     //send email
     eventEmitter.emit('sendemail',req.body)
     res.status(200).json({msg:"user added"})
})

//--------------------------------------confirm account-------------------------------------------------------------------------------

export const confirm=error_handeling(async(req,res,next) => {
    const{code}=req.body
    const {email,otpEmail,confirm}=req.user
    const compare=await bcrypt.compare(code,otpEmail)
    if(!compare||confirm==true){
        return next(new Error("invalid code or email already confirmed"))
    }
     await user.updateOne({email},{confirm:true})
     res.status(200).json({msg:'user confirm successfully'})
})
//-----------------------------------------login by system--------------------------------------------------------------------------
export const login=error_handeling(async(req,res,next) => {
    const{email,password}=req.body
     const User=await user.findOne({email,confirm:true})
    if(!User){
    return next(new Error("email not exist or not confirmed yet"))
    }
    const compare=await bcrypt.compare(password, User.password)
    if(!compare){
        return next(new Error("wronge password try again"))
    }
    
    const token=jwt.sign({email},User.role=='admin'?process.env.access_token_admin:process.env.access_token_user,{expiresIn:'1h'})
    const refresh_token=jwt.sign({email},user.role=='admin'?process.env.refresh_token_admin:process.env.refresh_token_user,{expiresIn:'1w'})
    res.json({token,refresh_token,message:'done'})
    

})


//-------------------------------------------refesh_token-----------------------------------------------------------------------------------
export const refesh_token=error_handeling(async(req,res,next) => {
    const{authantcation}=req.body
    
    const User=await decoded(authantcation,authantcation_types.refresh_token,next)
    if(!User){return }
    const email=User.email
    const token=jwt.sign({email},user.role=='admin'?process.env.access_token_admin:process.env.access_token_user,{expiresIn:'1h'})
    const refresh_token=jwt.sign({email},user.role=='admin'?process.env.refresh_token_admin:process.env.refresh_token_user,{expiresIn:'1w'})
    res.json({token,refresh_token})

})
//--------------------------------------------forget password-------------------------------------------------------------------------------------
export const forget_password=error_handeling(async(req,res,next) => {
    //send email
    eventEmitter.emit('forget_password',req.user)
     res.status(200).json({msg:'otp sent'})
})
//--------------------------------------------show my profile-------------------------------------------------------------------------------------
export const myprofile=error_handeling(async(req,res,next) => {
    const{_id}=req.user
    const User=await user.findById({_id}).populate({path:'friends'})
    res.status(200).json({User})
})

//---------------------------------------reassign password(update password)-----------------------------------------------------------------------
export const re_assign=error_handeling(async(req,res,next) => {
    const{code,oldpassword,newpassword}=req.body
    const{email,otppassword,password}=req.user
    const compare=await bcrypt.compare(code, otppassword)
    if(!compare){
        return next(new Error("invalid code "))
    }
    //oldpassword is exist or not
    const is_correct_password=await bcrypt.compare(oldpassword, password)
    if(!is_correct_password){
        return next(new Error("wronge oldpassword"))
    }

    const new_password= await bcrypt.hash(newpassword,+process.env.SECRET_KEY )
   
     await user.updateOne({email},{password:new_password, changepasswordAt:now()})

     res.status(200).json({msg:'password  update successfully'})
})

//-------------------------------------------social login--------------------------------------------------------------------------------------
export const social_login=error_handeling(async(req,res,next) => {
   
    const{idToken}=req.body
    const client = new OAuth2Client();
    async function verify() {
      const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.CLIENT_ID,  
      });
      const payload = ticket.getPayload();
      return payload
    }
   const payload= await verify();
   
   const{email,email_verified,name,picture}=payload
  
   const User = await user.findOne({email})
   //sign up with google
   if(!User){
      await user.create({email,provider:'google',name:name,coverimage:picture,confirm:email_verified,user_no:customAlphabet('123456789',4)()})
    
      return res.status(200).json({msg:"user added"})
   }
   //login by google
   if(User.provider=='system'){
    return next(new Error("you should login with system"))
 }
  //give him token
  const token = jwt.sign({email}, process.env.SECRET_KEY);
  return res.status(200).json({token})
})

//-----------------------------------update user info(name,phone,gender,coverimage)------------------------------------------------------------------
export const update_userinfo=error_handeling(async(req,res,next) => {
    const {email,coverimage}=req.user
    
   //update user phone
   if(req.body?.phone){
    const {phone}=req.body
    const hashphone= await CryptoJS.AES.encrypt(phone, process.env.SECRET_KEY).toString();
    req.body.phone=hashphone
}
    //update user coverimage
   if(req?.file){
   await cloudinary.uploader.destroy(coverimage.public_id
   )  //delete old image in cloudinary first
   const {public_id,secure_url}=await cloudinary.uploader.upload(req.file.path, { folder:`social_app/users/${req.user.user_no}/coverimage` });
   req.body.coverimage={public_id,secure_url}

}
     await user.updateOne({email},{...req.body})
     res.status(200).json({msg:'user info updated successfully'})
})
//--------------------------------------------share profile----------------------------------------------------------------------------------
export const share_profile=error_handeling(async(req,res,next) => {
    const {id}=req.params      //id of profile want to visit
    const User=await user.findOne({_id:id,isdeleted:false,_id:{ $nin: req.user.blockedUsers}})

    if(!user){
        return next(new Error("profile not found, may be deleted "))
    }
    if(User.blockedUsers.includes(req.user._id)){
        return next(new Error("user bloked you so you cann't view this profile "))
    }
    if(id.toString()==req.user._id.toString()){
       return res.status(200).json({your_profile:User})
    }
    
    else{
        const viwer_exist=User.viewers.find((viwer) => {
            return viwer.viewer_id.toString()===req.user._id.toString()
        })
        if(viwer_exist){
            viwer_exist.time.push(now())
            if( viwer_exist.time.length>5){
                viwer_exist.time=viwer_exist.time.splice(-5)
            }
        }
        else{
            User.viewers.push({viewer_id:req.user._id,time:[now()]})
        }

         await User.save()
         return res.status(200).json({your_FRIEND_profile:User})
} 
})
//-----------------------------------------------update email----------------------------------------------------------------------------------
export const update_email=error_handeling(async(req,res,next) => {
    const {email}=req.body
   const User=await user.findOne({email})
   if(User){
    return next(new Error("email already exist"))
   }const {_id}=req.user
   await user.updateOne({_id},{temp_email:email})
   eventEmitter.emit('confirmation',req.user)
   eventEmitter.emit('confirmation_new',{email})
   return res.status(200).json({msg:'check your email'})
})

//--------------------------------------replace email-------------------------------------------------------------------------------
export const replace_email=error_handeling(async(req,res,next) => {
    const{old_email_code,new_email_code}=req.body
    const {email,temp_email,otp_newemail,otp_oldemail}=req.user
    const compareold=await bcrypt.compare(old_email_code,otp_oldemail)
    const comparenew=await bcrypt.compare(new_email_code,otp_newemail)
    if(!compareold){
        return next(new Error("invalid old code"))
    }
    if(!comparenew){
        return next(new Error("invalid new code"))
    }

    //update in database    
     await user.updateOne({email},{email:temp_email,$unset:{temp_email:0,otp_newemail:0,otp_oldemail:0}})
     res.status(200).json({msg:'email change successfully'})
})
//--------------------------------------block user(cann't see my posts and comments)-------------------------------------------------------------------------------
export const block_user = error_handeling(async (req, res, next) => {
    const { email } = req.body;
    // Find the user to be blocked
    const blockedUser = await user.findOne({ email });
    if (!blockedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    // Prevent self-blocking
    if (req.user.email === email) {
        return res.status(400).json({ message: "You cannot block yourself" });
    }
    // Check if already blocked
    if (req.user.blockedUsers.includes(blockedUser._id)) {
        // if Blocked unblock him
        req.user.blockedUsers = req.user.blockedUsers.filter(id => id.toString() !== blockedUser._id.toString())
        await req.user.save();
        return res.status(400).json({ message: "User is now unblocked" });
    }// if unBlocked block him
    req.user.blockedUsers.push(blockedUser._id);
    await req.user.save();
    res.json({ message: `User with email ${email} has been blocked` });
});
//--------------------------------------unblock user-------------------------------------------------------------------------------
export const unblock_user = error_handeling(async (req, res, next) => {
    const { email } = req.body;
    // Find the user to be unblocked
    const blockedUser = await user.findOne({ email });
    if (!blockedUser) {
        return res.status(404).json({ message: "User not found" });
    }
    // Prevent self-unblocking
    if (req.user.email === email) {
        return res.status(400).json({ message: "You cannot unblock yourself" });
    }
    if (!req.user.blockedUsers.includes(blockedUser._id)) {
        return res.status(400).json({ message: "User is not blocked" });
    }
    // Remove from blocked list
    req.user.blockedUsers = req.user.blockedUsers.filter(id => id!== blockedUser._id);

    // Save the updated user document
    await req.user.save();

    res.json({ message: `User with email ${email} has been unblocked` });
});

//--------------------------------------add friend-------------------------------------------------------------------------------
export const add_friend = error_handeling(async (req, res, next) => {
    const { email } = req.body;
    const friend=await user.findOne({email,_id:{$nin:req.user.blockedUsers}}) //cannot add friend if i blocked him
    if(friend?.blockedUsers.includes(req.user._id)||!friend){
        return res.status(409).json({ message: `can't find this user`});
    }
    if (!req.user.friends.includes(friend._id)) {
        req.user.friends.push(friend._id);
        await req.user.save()
        //in other user
        friend.friends.push(req.user._id);
        await friend.save()
        return res.status(201).json({ message: `Friend ${email} added.`});
    } else {
        req.user.friends = req.user.friends.filter(id => id.toString() !== friend._id.toString());
        await req.user.save();
       friend.friends = friend.friends.filter(id => id.toString() !== friend._id.toString());
        await req.user.save();
        return res.status(200).json({ message: `You have unfriended ${email}.` });
    }
    
});


//--------------------------------------admin dashboard-------------------------------------------------------------------------------

export const dash_board=error_handeling(async(req,res,next) => {
const data =await Promise.all([
        user.find(),
        post.find().populate([{path:"user_id" ,select:'name email'},{
            path:'likes',select:'name email'
        },{path:'comments', populate:{path:'reply'}}])
]
    )
    res.status(200).json(data)
})
//--------------------------------------admin dashboard(update role)-------------------------------------------------------------------------------
export const update_role = error_handeling(async (req, res, next) => {
    const { new_role } = req.body;
    const { user_id } = req.params;

    const roleCondition = req.user.role === "super_admin" 
        ? { role: { $nin: ["super_admin"] } } 
        : { role: { $nin: ["super_admin", "admin"] } };
    const User = await user.findOneAndUpdate(
        { _id: user_id, isdeleted: false, ...roleCondition }, 
        { role: new_role, update_role_by: req.user._id },
        { new: true }
    );
    if (!User) {
        return res.status(403).json({ msg: "User not found or you are not authorized to update this role" });
    }
    res.status(200).json({ msg: "Role changed successfully", user: User });
});
