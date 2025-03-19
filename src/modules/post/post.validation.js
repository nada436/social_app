

import Joi from 'joi';
import { genral_schema } from './../user/user.validation.js';


export const new_schema = {
  body: Joi.object({
  content: Joi.string().required(),
  }),
  files: Joi.array().items(genral_schema.cloudinarySchema).optional(),
 
};

export const update_schema = {
  params: Joi.object({
    id: Joi.string().required(),
   
  }),
  body: Joi.object({
    content: Joi.string(),
  }),
  files: Joi.array().items(genral_schema.cloudinarySchema).optional(),
};

export const delete_and_restore_schema = {
  params: Joi.object({
    id: Joi.string().required(),
   
})
};





