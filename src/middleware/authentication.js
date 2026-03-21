
import jwt from 'jsonwebtoken'
import { error_handeling } from "../utils/error_handeling.js";
import { user } from '../database/models/user.model.js';
export const authentication_types={
    access_token:"access_token",
    refresh_token:"refresh_token"
}
export const decoded=error_handeling(async(authentication,authentication_type,next) => {
    if(!authentication){
        return next(new Error("correct token requard"));
    }
       const [role, token] = authentication.split(' ');
       if(!token || !role){
        return next(new Error("correct token requard"));
    }
    let access_token=''
    let refresh_token=''
    if (role=="user"){
        access_token=process.env.access_token_user
        refresh_token=process.env.refresh_token_user
    }
    else{
        access_token=process.env.access_token_admin
        refresh_token=process.env.refresh_token_admin
    }
    
        const tokendata=jwt.verify(token,authentication_type==authentication_types.access_token?access_token:refresh_token)    
        const User=await user.findOne({_id:tokendata.id})
        
        if(!User ){
            return next(new Error("something happen wrong  itis not valid token"));
        }

        if(User?.changepasswordAt){
           
        if(tokendata.iat<parseInt(User.changepasswordAt.getTime() / 1000, 10)){
            return next(new Error("token expired"));

        }}
        if(User?.deleteat){
                return next(new Error("user was deleted"));
    
            } return User

}
)


export const authentication = async (req, res, next) => {
    const authentication = req.headers.authentication;

    if (!authentication) {
        return next(new Error("correct token required"));
    }

    const User = await decoded(
        authentication,
        authentication_types.access_token,
        next
    );

    req.user = User;

    next();
};


export const socket_auth=async(authentcation) => {
   
    const [role, token] = authentcation.split(' ');
    let access_token=''
    if (role=="user"){
        access_token=process.env.access_token_user
    }
    else{
        access_token=process.env.access_token_admin
    }
    
        const tokendata=jwt.verify(token,access_token)    
        const User=await user.findOne({email:tokendata.email})
        
        if(!User ){
            return {message:"something happen wrong  itis not valid token",statuscode:'404'}
        }

        if(User?.changepasswordAt){
           
        if(tokendata.iat<parseInt(User.changepasswordAt.getTime() / 1000, 10)){
            return {message:"token expired",statuscode:'404'}

        }}
        if(User?.deleteat){
            return {message:"user was deleted",statuscode:'404'}
    
            } 

            return{ user:User,statuscode:'200'}

}
