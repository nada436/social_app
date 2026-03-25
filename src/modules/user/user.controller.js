import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { block_user_schema, confirm_schema, login_schema, reassign_password, replace_email_schema, share_schema, signup_schema, update_email_schema, update_role_schema, update_schema } from './user.validation.js';
import { add_friend,block_user, confirm, dash_board, forget_password, login, re_assign, refesh_token, replace_email, share_profile, sign_up, social_login, update_email, update_role, update_userinfo,myprofile, all_users} from "./user.serves.js";
import { fileTypes, multerHOST, multerLocal } from "../../middleware/multer.js";
import { authentication } from "../../middleware/authentication.js";
import { authorization } from './../../middleware/authorization.js';
export const user_routes=Router()


user_routes.post('/sign-up',multerHOST(fileTypes.image).fields([{ name: 'coverimage', maxCount: 1 }, { name: 'images', maxCount: 3 }      
]),validation(signup_schema),sign_up)
user_routes.post('/login',validation(login_schema),login)
user_routes.get('/refresh_token',refesh_token)
user_routes.patch('/forget_password',authentication,forget_password)
user_routes.patch('/reassign_password',validation(reassign_password),authentication,re_assign)
user_routes.post('/loginWithGmail',social_login)
user_routes.patch('/confirm',validation(confirm_schema),authentication,confirm)
user_routes.patch('/update_info',multerHOST(fileTypes.image).single('coverimage')     
,validation(update_schema),authentication,update_userinfo)
user_routes.get('/SHARE/:id',validation(share_schema),authentication,share_profile)
user_routes.patch('/update_email',validation(update_email_schema),authentication,update_email)
user_routes.patch('/replace_email',validation(replace_email_schema),authentication,replace_email)
user_routes.patch('/blockandunblock_user',validation(block_user_schema),authentication,block_user)
user_routes.get('/myprofile',authentication,myprofile)
user_routes.patch('/addfriebd',validation(update_email_schema),authentication,add_friend)
user_routes.get('/allusers',authentication,all_users)
//-------admin dashboard---------------------------------------------------------------
user_routes.get('/dashboard',authentication,authorization(['admin']),dash_board)
user_routes.patch('/dashboard/update_role/:user_id',validation(update_role_schema),authentication,authorization(['admin',"super_admin"]),update_role)