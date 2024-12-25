import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import mongoose from "mongoose";
import { OrderStatus } from "@ndytickets/common";
import { TicketDoc } from "./ticket";
// Uses Mongoose Ref/Population Feature

export { OrderStatus };

// An interface that describes the properties
// that are required to create an Order record.
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc; // Reference to Ticket document, not ticket Id
}

// An interface that describes the properties
// that a Order Document has.
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc; // Reference to Ticket document, not ticket Id
  version: number; // enforces typescript to use version instead of __v
}

// An interface that describes the properties
// that a Order Model has.
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

// Schema tells mongoose about all the different properties an order has.
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket", // reference to Ticket Doc Object
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
orderSchema.set("versionKey", "version");

// Using the Update If Current plugin to enforce versioning for updates
// Optimistic concurrency control (in case we have concurrent updates to the same order)
orderSchema.plugin(updateIfCurrentPlugin);

// the statics object is how we add a new method directly to the model itself
orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
