import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
// An interface that describes the properties
// that are required to create a new Ticket.
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

// An interface that describes the properties
// that a Ticket Model has
interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
}

// An interfsce that describes the properties
// that a Ticket Document has
interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  version: number; // enforces typescript to use version instead of __v
  orderId?: string; // optional: string or undefined
}

// Schema tells mongoose about all the different properties a ticket has
const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    userId: {
      type: String,
      require: true,
    },
    // locks the ticket from being updated in case it is being ordered
    // NOT required
    orderId: {
      type: String,
    },
  },
  {
    // Helps mangoose take our document and turn it into JSON
    toJSON: {
      // doc is the document object, and ret is the returned object
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

// Always use this pattern create a new Ticket for typescript type checking.
// Typescript won't have any idea about the Schema. To get TS involved,
// use build to enforce the properties passed are of type TicketAttrs
ticketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };
