import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@ndytickets/common";

import { deleteOrderRouter } from "./routes/delete";
import { indexOrderRouter } from "./routes/index";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();
app.set("trust proxy", true); // b/c traffic is being proxed through ingress-nginx, trust it.

app.use(json());

// enable setting a cookie in the response sent back to the user
app.use(
  cookieSession({
    signed: false, // disable encryption
    // secure: process.env.NODE_ENV !== "test", // true: cookies should only be used if client is communicating over an https connection, false: we are testing
    secure: false,
  })
);

// NOTE: Should be after using the cookieSession
// Req.session needs to be set before running currentUser
app.use(currentUser);

// Routes
app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
