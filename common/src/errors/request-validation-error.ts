import { ValidationError } from "express-validator"; // ValidationError describes the type of the validation attempt.
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  statusCode = 400;

  constructor(public errors: ValidationError[]) {
    super("Invalid request parameters");

    // Only b/c we are extending a built-in class
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors() {
    return this.errors.map((err) => {
      if (err.type === "field") {
        return { message: err.msg, field: err.path };
      }
      // otherwise, if type is not handled, return the error type
      return { message: err.msg, type: err.type };
    });
  }
}
