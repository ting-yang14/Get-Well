import Joi from "joi";
const usernameRegex = /^[\u4E00-\u9FFFa-zA-Z0-9]{1,8}$/;
const emailRegex = /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/;
const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
export const userSchemas = {
  login: Joi.object().keys({
    email: Joi.string().regex(emailRegex).required(),
    password: Joi.string().regex(passwordRegex).required(),
  }),
  register: Joi.object().keys({
    username: Joi.string().regex(usernameRegex).required(),
    email: Joi.string().regex(emailRegex).required(),
    password: Joi.string().regex(passwordRegex).required(),
  }),
  patchUser: Joi.object().keys({
    username: Joi.string().max(8).required(),
    avatarFileName: Joi.string(),
    gender: Joi.string().required(),
    height: Joi.number().min(80).max(200).required(),
    weight: Joi.number().min(30).max(200).required(),
  }),
};

export const recordSchemas = {
  postRecord: Joi.object().keys({
    exerciseName: Joi.string().required(),
    exerciseCounts: Joi.number().required(),
    exerciseRecord: Joi.object({
      startTime: Joi.string().required(),
      data: Joi.array()
        .items(
          Joi.object({
            acc_X: Joi.number().required(),
            acc_Y: Joi.number().required(),
            acc_Z: Joi.number().required(),
            ori_alpha: Joi.number().required(),
            ori_beta: Joi.number().required(),
            ori_gamma: Joi.number().required(),
            time: Joi.date().required(),
          })
        )
        .required(),
      endTime: Joi.string().required(),
    }).required(),
    videoFileName: Joi.string().required(),
  }),
  patchRecord: Joi.object().keys({
    exerciseName: Joi.string().required(),
    exerciseCounts: Joi.number().required(),
  }),
};
