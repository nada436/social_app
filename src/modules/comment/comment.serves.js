

import cloudinary from "../../cloudinary/index.js"
import { comment } from "../../database/models/comment.model.js"
import { post } from "../../database/models/post.model.js"

import { error_handeling } from "../../utils/error_handeling.js"
import { customAlphabet} from 'nanoid'
//--------------------------------------create new comment-------------------------------------------------------------------------------

export const add_comment=error_handeling(async(req,res,next) => {
    const{ref_id}=req.params
    const{onmodel}=req.body
    const comment_no=customAlphabet('123456789',4)()
    if(onmodel=='Post'&&!(await post.findOne({_id:ref_id,isdeleted:{$exists:false}}))){
      return next(new Error("invalid post you cant make acomment"))
    }
    else if(onmodel === 'Comment' && !(await comment.findOne({_id:ref_id,isdeleted:{$exists:false}}))){
        return next(new Error("invalid comment you cant make areply"))
    }
   
    if(req?.files.length){
        let files_arr=[]
        for (const file of req.files) {
            const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`social_app/users/${req.user.user_no}/posts/${Post.post_no}/comments/${comment_no}`})
            files_arr.push({secure_url,public_id})
        }
    req.body.attachments= files_arr 
    }
     await comment.create({...req.body,user_id:req.user._id,comment_no,ref_id})
     res.status(200).json({msg:'comment added successfully'})
})
//--------------------------------------update comment-------------------------------------------------------------------------------
export const update_comment=error_handeling(async(req,res,next) => {
    const{ref_id,comment_id}=req.params
    const Comment=await comment.findOne({_id:comment_id,isdeleted:{$exists:false},user_id:req.user._id})
    
    if(Comment.onmodel=='Post'&&!(await post.findOne({_id:ref_id,isdeleted:{$exists:false}}))){
        return next(new Error("invalid post "))
      }
      else if(Comment.onmodel == 'Comment' && !(await comment.findOne({_id:ref_id,isdeleted:{$exists:false}}))){
          return next(new Error("invalid comment "))
      }
  
    if(req?.files.length){
        let files_arr=[]
        for (const file of Comment.attachments) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        for (const file of req.files) {
            const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`social_app/users/${req.user.user_no}/posts/${Comment.ref_id.post_no ||Comment.ref_id.comment_no}/comments/${Comment.comment_no}`})
            files_arr.push({secure_url,public_id})
        }
    req.body.attachments= files_arr 
    }
     await comment.updateOne({_id:comment_id},{...req.body})

     res.status(200).json({msg:'comment updateded successfully'})})

//--------------------------------------freeze comment-------------------------------------------------------------------------------
export const freeze_comment=error_handeling(async(req,res,next) => {
    const{ref_id,comment_id}=req.params
    const Comment=await comment.findOne({_id:comment_id,isdeleted:{$exists:false}})
    if(!Comment){
      return next(new Error('invalid comment or invalid post'))
    }
    if(req.user.role!='admin'&&req.user._id.toString()!=Comment.user_id.toString()&& Comment.post_id.toString()!=req.user._id.toString()){
        return next(new Error('you are not authorize'))
    }
     await comment.updateOne({_id:comment_id},{isdeleted:true,deletedby:req.user._id})

     res.status(200).json({msg:'comment freeze successfully'})})
//-----------------------------------------------------unfreeze comment-------------------------------------------------------------------------------
export const unfreeze_comment=error_handeling(async(req,res,next) => {
    const{ref_id,comment_id}=req.params
    const Comment=await comment.findOne({_id:comment_id,deletedby:req.user._id,isdeleted:true})
    if(!Comment){
        return next(new Error("invalid comment"))
    }
    await comment.updateOne({_id:comment_id},{$unset:{deletedby:0,isdeleted:0}})
    res.status(200).json({msg:'comment unfreeze successfully'})
})