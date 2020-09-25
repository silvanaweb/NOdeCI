const { clearHash } = require('../services/cache-nested')


module.exports = async (req, res, next) => {
  // we call the next function that is the route handler
  // that does whatever is needed to be done
  // in this way the middleware is running after the route has done its operations
  await next();
  // after next has been executed, it returns to here
  clearHash(req.user.id)
}
