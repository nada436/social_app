

import Joi from 'joi';

export const genral_schema = {
  code: Joi.string().length(4).required(),
  name: Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(6),
  cpassword: Joi.string()
    .required()
    .messages({ 'any.only': 'Confirm password must match password' }),

  cloudinarySchema: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    destination: Joi.string().required(),
    filename: Joi.string().required(),
    path: Joi.string().required(),
    size: Joi.number().required(),
  }),
};

// Sign-up Schema (Fixed for File Upload)
export const signup_schema = {
  body: Joi.object({
    name: genral_schema.name.required(),
    email: genral_schema.email.required(),
    password: genral_schema.password.required(),
    cpassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Confirm password must match password' }),
    phone: Joi.string().length(12).required(),
    gender: Joi.string().valid('male', 'female').required(),
  }),
  files: Joi.object({
    images: Joi.array().items(genral_schema.cloudinarySchema).required(),
    coverimage: Joi.array().items(genral_schema.cloudinarySchema).required(),
  }),
};

// Confirm Code Schema
export const confirm_schema = {
  body: Joi.object({
    code: genral_schema.code,
  }),
};

// Login Schema
export const login_schema = {
  body: Joi.object({
    email: genral_schema.email.required(),
    password: genral_schema.password.required(),
  }),
};

// Reset Password Schema
export const reassign_password = {
  body: Joi.object({
    oldpassword: genral_schema.password.required(),
    newpassword: genral_schema.password.required(),
    cnewpassword: Joi.string()
      .valid(Joi.ref('newpassword'))
      .required()
      .messages({ 'any.only': 'Confirm password must match password' }),
    code: genral_schema.code,
  }),
};

// Update Profile Schema
export const update_schema = {
  body: Joi.object({
    name: genral_schema.name,
    phone: Joi.string().length(12),
    gender: Joi.string().valid('male', 'female'),
  }),
  files: Joi.object({
    coverimage: Joi.array().items(genral_schema.cloudinarySchema),
  }),
};

// Share Schema
export const share_schema = {
  params: Joi.object({
    id: Joi.string().required(),
  }),
};

// Update Email Schema
export const update_email_schema = {
  body: Joi.object({
    email: genral_schema.email.required(),
  }),
};

// Replace Email Schema
export const replace_email_schema = {
  body: Joi.object({
    old_email_code: genral_schema.code,
    new_email_code: genral_schema.code,
  }),
};


export const update_role_schema = {
  body: Joi.object({
    new_role:Joi.string().valid('user','admin').required(),
  }),
};


export const block_user_schema = {
  body: Joi.object({
    email:Joi.string().email().required(),
  }),
};
