import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
  var signin: () => Promise<string[]>; // Add the type declaration for the signin function
}

let mongo: MongoMemoryServer;

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
global.signin = async () => {
  const email = "test@test.com";
  const password = "password";

  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);
  const cookie = response.get("Set-Cookie");

  return cookie!;
};
