
import cloudinary from "../../cloudinary/index.js"
import { post} from "../../database/models/post.model.js"
import { error_handeling } from "../../utils/error_handeling.js"
import { customAlphabet} from 'nanoid'
import { bagination } from "../../utils/features/bagination.js"
import { match } from "assert"

//--------------------------------------create new post-------------------------------------------------------------------------------

export const add_post=error_handeling(async(req,res,next) => {
    let files_arr=[]
    const post_no=customAlphabet('123456789',4)()
    if(req?.files.length){
        for (const file of req.files) {
            const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`social_app/users/${req.user.user_no}/posts/${post_no}`})
            files_arr.push({secure_url,public_id})
        }
    req.body.attachments= files_arr 
    }
     await post.create({...req.body,user_id:req.user._id,post_no})
     res.status(200).json({msg:'post added successfully'})
})
//-----------------------------------------update post by owner------------------------------------------------------------------------------------------

export const update_post=error_handeling(async(req,res,next) => {
    const{id}=req.params
    const Post=await post.findOne({_id:id,user_id:req.user._id,isdeleted:{$exists:false}})
    if(!Post){
        next(new Error("invalid post"))
    }
    
    if(req.files.length){
        let files_arr=[]
        for (const file of Post.attachments) {
            await cloudinary.uploader.destroy(file.public_id)
        }
        for (const file of req.files) {
            const{secure_url,public_id}=await cloudinary.uploader.upload(file.path,{folder:`social_app/users/${req.user.user_no}/posts/${Post.post_no}`})
            files_arr.push({secure_url,public_id})
        }
        req.body.attachments= files_arr 
    }
    await post.updateOne({_id:id},{...req.body})
    res.status(200).json({msg:'post updated successfully'})
})

//--------------------------------------------------soft delete(by admin or post owner)------------------------------------------------------------------------------
export const delete_post=error_handeling(async(req,res,next) => {
    const{id}=req.params
    const condition=req.user.role=='admin'?{}:{user_id:req.user._id}
    const Post=await post.findOne({_id:id,...condition,isdeleted:{$exists:false}})
    if(!Post){
        next(new Error("invalid post"))
    }
    await post.updateOne({_id:id},{ $set: { isdeleted: true, deletedby: req.user._id } })
    res.status(200).json({msg:'delete successfully'})
})



//----------------------------------------------------- restore post with all comments-------------------------------------------------------------------------------
export const restore_post=error_handeling(async(req,res,next) => {
    const{id}=req.params
    const Post=await post.findOne({_id:id,deletedby:req.user._id,isdeleted:true})
    if(!Post){
        return next(new Error("invalid post"))
    }
    await post.updateOne({_id:id},{ $unset: { deletedby: 0, isdeleted:0}})
    res.status(200).json({msg:'restore successfully'})
})
//----------------------------------------------------- like/unlike post-------------------------------------------------------------------------------
export const make_react=error_handeling(async(req,res,next) => {
    const{id}=req.params
    const Post=await post.findOne({_id:id,isdeleted:{$exists:false}, user_id: { $nin: req.user.blockedUsers}}).populate({path:'user_id'})
    if(!Post){
        return next(new Error("invalid post"))
    }
    if(Post.user_id.blockedUsers.includes(req.user._id)){
        return next(new Error("user bloked you so you cann't view this POST "))
    } 
    if (Post.likes.includes(req.user._id)) {
        await post.updateOne({ _id: id }, { $pull: { likes: req.user._id } });
        return res.status(200).json({ msg: "Like removed" });
    } else {
        await post.updateOne({ _id: id }, { $addToSet: { likes: req.user._id } });
        return res.status(200).json({ msg: "Liked successfully"});
    }
   

})

//-----------------------------------------------------Retrieves a paginated list of posts while excluding posts,comments,replays created by blocked users.--------------------
export const get_posts = error_handeling(async (req, res, next) => {
    const { page } = req.query;

    const { _page, data } = await bagination(
        { page, model: post, populate: [
            { path: "user_id", select: 'name email' },
            { path: 'likes', select: 'name email',match:{ _id: { $nin: req.user.blockedUsers } }},
            { path: 'comments', populate: { path: 'reply',match: { user_id: { $nin: req.user.blockedUsers } } },match: { user_id: { $nin: req.user.blockedUsers } } }
        ]}, 
        req.user.blockedUsers 
    );
    res.status(200).json({ _page, data });
});
//-----------------------------------------------------undo only the post they created within 2 minutes of its creation..------------------------------------------------------------------------------
export const undo_post = error_handeling(async (req, res, next) => {
    const { id } = req.params;
    const Post = await post.findOne({ _id: id, user_id: req.user._id });

    if (!Post) {
        return res.status(404).json({ message: "Post not found or you don't have permission." });
    }

    const timeDiff = (Date.now() - Post.createdAt.getTime()) / 1000; 
    if (timeDiff > 120) {
        return res.status(403).json({ message: "Undo period expired. You can’t delete this post now." });
    }

    await post.deleteOne({ _id:id }); 
    res.status(200).json({ message: "Post successfully undone." });
});
//-----------------------------------------------------user can archive a post, but only if 24 hours have passed since its creation.------------------------------------------------------------------------------
export const archive_post = error_handeling(async (req, res, next) => {
    const { id } = req.params;

    const Post = await post.findOne({ _id:id, user_id: req.user._id });

    if (!Post) {
        return res.status(404).json({ message: "Post not found or you don't have permission." });
    }

    const timeDiff = (Date.now() - Post.createdAt.getTime()) / (1000 * 60 * 60); //BY HOURS

    if (timeDiff < 24) {
        return res.status(403).json({ message: "You can archive this post only after 24 hours." });
    }

    Post.isArchived = true;
    await Post.save();

    res.status(200).json({ message: "Post archived successfully." });
});
