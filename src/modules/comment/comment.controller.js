import { Router } from "express";
import { multerHOST, fileTypes } from './../../midelware/multer.js';
import { validation } from './../../midelware/validation.js';
import { authantcation } from './../../midelware/authantcation.js';
import { add_comment,update_comment,freeze_comment ,unfreeze_comment} from './comment.serves.js';
import { newcomment_schema,updatecomment_schema ,delete_and_restore_commentschema} from './comment.validation.js';

export const comment_routes=Router({mergeParams:true})
comment_routes.post('/new',multerHOST(fileTypes.image).array('attachments',3),validation(newcomment_schema),authantcation,add_comment)
comment_routes.patch('/:comment_id/update',multerHOST(fileTypes.image).array('attachments',3),validation(updatecomment_schema),authantcation,update_comment)
comment_routes.delete('/:comment_id/freeze',validation(delete_and_restore_commentschema),authantcation,freeze_comment)
comment_routes.patch('/:comment_id/unfreeze',validation(delete_and_restore_commentschema),authantcation,unfreeze_comment)