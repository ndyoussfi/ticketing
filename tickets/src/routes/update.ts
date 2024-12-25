import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
  BadRequestError,
} from "@ndytickets/common";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";

const router = express.Router();

// Request validation and authentication are both handled using middlewares.
router.put(
  "/api/tickets/:id",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price is required and must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);

    // Does the ticket exist?
    if (!ticket) {
      throw new NotFoundError();
    }

    // Is the ticket reserved, meaning is the orderId defined?
    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit a reserved ticket");
    }

    // If the ticket exists, does the currentUser own it?
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // If the ticket exists and the user owns it, update it
    // update the ticket data in memory
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    });
    // save the update in the db
    await ticket.save();

    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.send(ticket);
  }
);

export { router as updateTicketRouter };
