


import mongoose from "mongoose";




const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
     
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      
    },
    gender:{
        type: String,enum: ['male', 'female']  
    }
    ,
    confirm: {
      type: Boolean,
      default:false
    },
    isdeleted: {
      type: Boolean,
      default: false,
    },
    changepasswordAt: {
      type: Date,
    },
    role: {
      type: String,
      default:"user"
    },
    coverimage: {
      public_id: { type: String, required: true }, 
      secure_url: { type: String, required: true }, 
    },
    
    images: {
      type: [{
        public_id: { type: String, required: true }, 
        secure_url: { type: String, required: true }, 
      }],
    },
    otpEmail: {
      type: String,
    },
    provider:{  type: String,enum: ['google', 'system']},
    otppassword:String,
    viewers: [{
      viewer_id: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User'  
      },
      time: [
           Date
      ]
  }],blockedUsers: [
    {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'  
    }],
   friends: [
      {
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'User'  
      }],

    temp_email:String,
  otp_oldemail:String,
  otp_newemail:String,
  user_no:String,
  update_role_by:{
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'  
},
  },
 
  {
    timestamps: true,
  }
);

export const user = mongoose.model('User', userSchema)||mongoose.models.User;


