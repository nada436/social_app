
import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
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
    ref_id:{ type: mongoose.Schema.Types.ObjectId, 
      refPath: "onmodel"},                                       //hold commentid to make reply on it or postid to make comment on post

      onmodel:{
       type:String,
       enum: ['Post', 'Comment'],
        require:true
      },
    attachments: {
      type: [{
        public_id: { type: String, required: true }, 
        secure_url: { type: String, required: true }, 
      }],
    },
    likes: [{
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User'   }],
          comment_no:String},
          
 
  {
    timestamps: true,toJSON:{virtuals:true},toObject:{virtuals:true}
  }
);
commentSchema.virtual('reply',{
  ref:'Comment'
  ,localField:'_id',
  foreignField:'ref_id'
})


export const comment = mongoose.model('Comment',commentSchema)||mongoose.models.Comment;


