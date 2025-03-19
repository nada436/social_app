import mongoose from "mongoose";
import { comment } from "./comment.model.js";

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    
    isdeleted: {
      type: Boolean,
    },
    deletedby:{
         type: mongoose.Schema.Types.ObjectId, 
          ref: 'User'
    },
    user_id:{ type: mongoose.Schema.Types.ObjectId, 
      ref: 'User'},
    attachments: {
      type: [{
        public_id: { type: String, required: true }, 
        secure_url: { type: String, required: true }, 
      }],
    },
    likes: [{
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User'   }],post_no:String,isArchived: { type: Boolean, default: false }},
          
 
  {
    timestamps: true,toJSON:{virtuals:true},toObject:{virtuals:true}
  }
);//WHEN DELETE POST delete all comments on it
postSchema.pre("updateOne", { query: true }, async function (next) {
  const update = this.getUpdate();
  const postId = this.getQuery()._id;
  if (update?.$set?.isdeleted === true) {
     const Comments= await comment.find({ref_id: postId })
     await comment.updateMany({ ref_id: postId }, { $set: { isdeleted: true } });   //DELEDE ALL COMMENTS   ON DELETED POST
     for (const Comment of Comments) {
      await comment.updateMany({ ref_id:Comment._id }, { $set: { isdeleted: true } }); ////DELEDE ALL REPLIES ON DELETED POST
     }
                   
  }
   else if (update?.$unset?.isdeleted==0) {
    const Comments= await comment.find({ref_id: postId })
    await comment.updateMany({ ref_id: postId }, { $unset: { isdeleted:0}});   //DELEDE ALL COMMENTS   ON DELETED POST
   for (const Comment of Comments) {
    await comment.updateMany({ ref_id:Comment._id }, { $unset: { isdeleted: 0} });  ////DELEDE ALL REPLIES ON DELETED POST
   }             
}
  next();
});

postSchema.virtual('comments',{
  ref:'Comment'
  ,localField:'_id',
  foreignField:'ref_id'
})
export const post = mongoose.model('POST',postSchema)||mongoose.models.POST;


