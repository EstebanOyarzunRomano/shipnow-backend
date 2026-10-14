import { NotFoundError } from "../errors/app.error.js";
import { ERROR_CODES } from "../constants/error-codes.js";

const notFoundMiddleware = (req, res, next) => {
  const error = ERROR_CODES.ROUTE_NOT_FOUND;

  next(
    new NotFoundError(
      error.message,
      error.code
    )
  );
};

export default notFoundMiddleware;