import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties
// that are required to create a new record (User).
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// Schema tells mongoose about all the different properties a user has
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  {
    // Helps mangoose take our document and turn it into JSON
    toJSON: {
      // doc is the document object, and ret is the returned object
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password; // remove the password property
        delete ret.__v;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password") as string);
    this.set("password", hashed);
  }
  done();
});

// Always use this pattern create a new User for typescript type checking.
// Typescript won't have any idea about the Schema. To get TS involved,
// use build to enforce the properties passed are of type UserAttrs
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
