import express from "express";
import { currentUser } from "@ndytickets/common";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, (req, res) => {
  // the currentUser middleware handles everything for us.
  // send back the augmented type definition currentUser of type UserPayload.
  // if it's undefined, send back null
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
