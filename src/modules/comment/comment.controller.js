import { Router } from "express";
import { multerHOST, fileTypes } from './../../middleware/multer.js';
import { validation } from './../../middleware/validation.js';
import { authentication } from './../../middleware/authentication.js';
import { add_comment,update_comment,freeze_comment ,unfreeze_comment} from './comment.serves.js';
import { newcomment_schema,updatecomment_schema ,delete_and_restore_commentschema} from './comment.validation.js';

export const comment_routes=Router({mergeParams:true})
comment_routes.post('/new',multerHOST(fileTypes.image).array('attachments',3),validation(newcomment_schema),authentication,add_comment)
comment_routes.patch('/:comment_id/update',multerHOST(fileTypes.image).array('attachments',3),validation(updatecomment_schema),authentication,update_comment)
comment_routes.delete('/:comment_id/freeze',validation(delete_and_restore_commentschema),authentication,freeze_comment)
comment_routes.patch('/:comment_id/unfreeze',validation(delete_and_restore_commentschema),authentication,unfreeze_comment)