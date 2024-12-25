import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken"; // to create and validate the token

import { validateRequest, BadRequestError } from "@ndytickets/common";
import { User } from "../models/user";

const router = express.Router();

// body is applied as a middleware
router.post(
  "/api/users/signup",
  [
    body("email")
      .isEmail() // is the email property structured as an email?
      .withMessage("Email must be valid"), // produce if not valid
    body("password")
      .trim() // no leading or trailing spaces on the passwd
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  validateRequest, // do this after the validation above
  async (req: Request, res: Response) => {
    // Check if email already exists
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }

    // create user
    const user = User.build({
      email,
      password,
    });
    // save user to the DB
    await user.save();

    // generate JWT
    // Asynchronous if a callback is supplied, the callback is called with the err or the JWT
    // Synchrounous returns the JsonWebToken as string
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY! // should be created using kubctl imperative command approach, which also (and should not be) listed in config file
      // OR listed in the config file as a reference to an local environment variable for a declarative approach
    );

    // store it on the session object
    // req.session.jwt = userJwt; // recreate the object with a session property
    // cookie session will this object, serialize it and send it back to the user's browser
    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
