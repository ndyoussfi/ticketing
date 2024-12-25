import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken"; // to create and validate the token

import { Password } from "../services/password";
import { User } from "../models/user";
import { validateRequest, BadRequestError } from "@ndytickets/common";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email")
      .isEmail() // is the email property structured as an email?
      .withMessage("Email must be valid"), // produce if not valid
    body("password")
      .trim() // no leading or trailing spaces on the passwd
      .notEmpty()
      .withMessage("You must supply a password"),
  ],
  validateRequest, // do this after the validation above
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("Invalid credentials");
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );

    if (!passwordsMatch) {
      throw new BadRequestError("Invalid credentials");
    }

    // generate JWT
    // Asynchronous if a callback is supplied, the callback is called with the err or the JWT
    // Synchrounous returns the JsonWebToken as string
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
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

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
