import { Router } from "express";
import { fileTypes, multerHOST } from "../../midelware/multer.js";
import { add_post, archive_post, delete_post, get_posts, make_react, restore_post, undo_post, update_post } from "./post.serves.js";
import { delete_and_restore_schema, new_schema, update_schema } from "./post.validation.js";
import { validation } from "../../midelware/validation.js";
import { authantcation } from "../../midelware/authantcation.js";
import { comment_routes } from "../comment/comment.controller.js";


export const post_routes=Router()
post_routes.use('/:ref_id/comment',comment_routes)
post_routes.post('/new',multerHOST(fileTypes.image).array('attachments',3),validation(new_schema),authantcation,add_post)
post_routes.patch('/update/:id',multerHOST(fileTypes.image).array('attachments',3),validation(update_schema),authantcation,update_post)
post_routes.delete('/delete/:id',validation(delete_and_restore_schema),authantcation,delete_post)
post_routes.patch('/restore/:id',validation(delete_and_restore_schema),authantcation,restore_post)
post_routes.patch('/react/:id',validation(delete_and_restore_schema),authantcation,make_react)
post_routes.get('/',authantcation,get_posts)
post_routes.delete('/undo/:id',authantcation,undo_post)
post_routes.patch('/archive/:id',authantcation,archive_post)
