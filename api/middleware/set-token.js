module.exports = (req, _res, next) => {
  try {
    req.token = req.headers.authorization.split("Bearer ")[1];
    next();
  } catch (_e) {
    req.token = null;
    next();
  }
};
