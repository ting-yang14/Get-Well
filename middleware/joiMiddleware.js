export const joiMiddleware = (schema, property) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: true, // remove unknown props
    };
    const { value, error } = schema.validate(req[property], options);
    const valid = error == null;
    if (valid) {
      req.body = value;
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(", ");
      console.log("error", message);
      res.status(422);
      throw new Error("輸入資料格式錯誤");
    }
  };
};
