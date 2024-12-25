import mongoose from "mongoose";
import { OrderStatus } from "@ndytickets/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// This is replication of the Order model implemented specifically for the Payments Service
// NOTE: We DO NOT share Models between services

// An interface that describes the properties
// that are required to create a Order for payment record.
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties
// that a Order for Payment Document has.
interface OrderDoc extends mongoose.Document {
  version: number; // maintained by mongoose-update-if-current module
  userId: string;
  price: number;
  status: OrderStatus;
}

// An interface that describes the properties
// that a Order for Payment Model has.
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    status: {
      type: String,
      require: true,
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
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
};

// Changing the __v to version
// orderSchema.set("versionKey", "version");

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };
