import mongoose from "mongoose";

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
          ref: 'User'   }],post_no:String},
          
 
  {
    timestamps: true,toJSON:{virtuals:true},toObject:{virtuals:true}
  }
);
postSchema.virtual('comments',{
  ref:'Comment'
  ,localField:'_id',
  foreignField:'ref_id'
})
export const post = mongoose.model('POST',postSchema)||mongoose.models.POST;


