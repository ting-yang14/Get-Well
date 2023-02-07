export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  console.log(`Error message: ${err}`);
  if (statusCode === 500) {
    res.json({ success: false, message: "伺服器錯誤" });
  } else {
    res.json({ success: false, message: err.message });
  }
};
