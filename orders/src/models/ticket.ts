import mongoose from "mongoose";
import { Order, OrderStatus } from "./order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
// This is replication of the Ticket model implemented specifically for the Orders Service
// NOTE: We DO NOT share Models between services

// An interface that describes the properties
// that are required to create a ticket for order record.
interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

// An interface that describes the properties
// that a Ticket for order Document has.
export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number; // enforces typescript to use version instead of __v
  isReserved(): Promise<boolean>;
}

// An interface that describes the properties
// that a Ticker for order Model has.
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  // Ensures looking up the previous version prior to an update (optimistic concurrency control)
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// Changing the __v to version
ticketSchema.set("versionKey", "version");

// Using the Update If Current plugin to enforce versioning for updates
// Optimistic concurrency control (in case we have concurrent updates to the same ticket)
ticketSchema.plugin(updateIfCurrentPlugin);

// the following middleware does the exact same thing as the updateIfCurrentPlugin
// ticketSchema.pre("save", function (done) {
//   this.$where = {
//     version: this.get("version") - 1,
//   };

//   done();
// });

// Adding a findByEvent method direclty to the model for Optimistic concurrency control
// Ensures the data object contains the version prior to emitting an event to update a ticket
ticketSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1, // The updated ticket has a new version, lookup the previous one prior to updating it
  });
};

// the statics object is how we add a new method directly to the model itself
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

// the methods object is how we add a new method to the document
// function keyword is a MUST to access the context (this), and NOT an arrow function
ticketSchema.methods.isReserved = async function () {
  // Run query to look at all orders. Find an order where the ticket
  // is the ticket we just found *and* the orders status is *not* cancelled.
  // If we find an existing from that, it means ticket *is* reserved
  const existingOrder = await Order.findOne({
    // this === the ticket document that we just called 'isReserved' on.
    ticket: this,
    status: {
      // mongoose will look at the status in the set of values
      // if the status is any of the following, ticket is already reserved
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  // if existingOrder is null, flip it to true with first exclamation and flip it to false with the 2nd exclamation.
  // otherwise if existingOrder is not null, flip it to false with first exclamation and flip it to true with the 2nd exclamation.
  return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
