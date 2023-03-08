export const joiMiddleware = (schema, property) => {
  return (req, res, next) => {
    const options = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
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
