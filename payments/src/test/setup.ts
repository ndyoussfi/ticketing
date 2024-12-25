import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signin: (id?: string) => string[]; // Add the type declaration for the signin function
}

// Use this mock file for every test
jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;

process.env.STRIPE_KEY =
  "sk_test_51QXfEbLBmxS6YdVGU03EK4uN8vStclm96zteasqpJEShfiVsJJPJ9yMCynvOTJ5fe4k1Q6fx7p0E3n5iXPpWG0l700NiBXGQ4q";

// beforeAll is hook function that runs before all our tests start to execute
beforeAll(async () => {
  process.env.JWT_KEY = "asdfasdf";

  mongo = await MongoMemoryServer.create(); // Use create method
  const mongoUri = mongo.getUri(); // Get URI after starting the server

  await mongoose.connect(mongoUri);
  await mongoose.connect(mongoUri);
});

// hook function that runs before each of our tests
beforeEach(async () => {
  jest.clearAllMocks(); // Reset the test data between all tests
  const collections = await mongoose.connection.db?.collections()!;

  // delete all the data inside resetting the data between each test
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// hook that runs after all our tests are complete
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// function assigned to global scope to be easily used by different test files
global.signin = (id?: string) => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  }; // test credentials for tests requiring authentication
  // Create a JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  // Build session object. { jwt: MY_JWT }
  const session = { jwt: token };
  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);
  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with the encoded data.
  return [`session=${base64}`];
};
