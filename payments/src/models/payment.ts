import mongoose from "mongoose";

// An interface that describes the properties
// that are required to create a Payment record.
interface PaymentAttrs {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties
// that a Payment Document has.
interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
}

// An interface that describes the properties
// that a Payment Model has.
interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      require: true,
      type: String,
    },
    stripeId: {
      require: true,
      type: String,
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

// the statics object is how we add a new method directly to the model itself
paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

// Changing the __v to version
// orderSchema.set("versionKey", "version");

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };
