import { Router } from "express";
import { fileTypes, multerHOST } from "../../middleware/multer.js";
import { add_post, archive_post, delete_post, get_myposts, get_post, get_posts, make_react, restore_post, undo_post, update_post } from "./post.serves.js";
import { delete_and_restore_schema, new_schema, update_schema } from "./post.validation.js";
import { validation } from "../../middleware/validation.js";
import { authentication } from "../../middleware/authentication.js";
import { comment_routes } from "../comment/comment.controller.js";


export const post_routes=Router()
post_routes.use('/:ref_id/comment',comment_routes)
post_routes.post('/new',multerHOST(fileTypes.image).array('attachments',3),validation(new_schema),authentication,add_post)
post_routes.patch('/update/:id',multerHOST(fileTypes.image).array('attachments',3),validation(update_schema),authentication,update_post)
post_routes.delete('/delete/:id',validation(delete_and_restore_schema),authentication,delete_post)
post_routes.patch('/restore/:id',validation(delete_and_restore_schema),authentication,restore_post)
post_routes.patch('/react/:id',validation(delete_and_restore_schema),authentication,make_react)
post_routes.get('/',authentication,get_posts)
post_routes.get('/my_posts',authentication,get_myposts)
post_routes.delete('/undo/:id',authentication,undo_post)
post_routes.patch('/archive/:id',authentication,archive_post)
post_routes.get('/:id',authentication,get_post)