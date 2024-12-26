import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

// This is how we can reach into an existing type definition and modify it.
declare global {
  namespace Express {
    interface Request {
      // Augemting the Request interface to have currentUser of type UserPayload to be OPTIONALLY (?) defined.
      currentUser?: UserPayload;
    }
  }
}

// This middleware function tries to figure out whether or not the user is loggedin
export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If they are not, we are not throwing any error, the other middleware should take care of that.
  // if its not set or if the JWT is invalid, return early
  if (!req.session?.jwt) {
    return next();
  }

  // If they are, we want to extract information out of that payload and set it on req.currentuser
  try {
    // verify() return a string or an object if successful
    // The object should be of the same structure of UserPayload interface defined above.
    // if it fails, it will return an error, which we catch with next() later.
    const payload = jwt.verify(
      req.session.jwt,
      process.env.JWT_KEY!
    ) as UserPayload;
    // Augmenting the definition of a Request to add an additional property of currentUser
    // Typescript now knows that we are assigning something of type UserPayload to the req.currentUser property.
    // Now we tell typescript that the currentUser property can be optionally defined, which is of type UserPayload
    req.currentUser = payload;
  } catch (error) {
    // next() will catch anything later on.
  }

  next();
};
