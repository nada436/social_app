

import Joi from 'joi';
import { genral_schema } from './../user/user.validation.js';


export const newcomment_schema = {
    body: Joi.object({
    content: Joi.string().required(),
    onmodel:Joi.string().required(),
  }),
  files: Joi.array().items(genral_schema.cloudinarySchema).optional(),
  params: Joi.object({
  ref_id: Joi.string().required(),

})
};

export const updatecomment_schema = {
  body: Joi.object({
    content: Joi.string(),
  }),
  files: Joi.array().items(genral_schema.cloudinarySchema).optional(),
  params: Joi.object({
  comment_id:Joi.string().required(),
  ref_id: Joi.string().required(),
})
};

export const delete_and_restore_commentschema = {
  params: Joi.object({
    comment_id:Joi.string().required(),
  ref_id: Joi.string().required(),
  })
};





