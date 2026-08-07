const allowedRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const checkRole = allowedRoles.includes(req.user.role);

    if (checkRole) {
      next();
    } else {
      return res.status(403).json({
        message: "Access Denied",
      });
    }
  };
};

module.exports = allowedRoles;
