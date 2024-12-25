import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns a 404 if the provided ticket id does not exist", async () => {
  // using mongoose to generate a realistic id for the lookup test
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signin())
    .send({ title: "gdfgghj", price: 20 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  // using mongoose to generate a realistic id for the lookup test
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "gdfgghj", price: 20 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  // creating ticket and capturing the response to get the id after creation
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signin()) // user1 creates ticket
    .send({ title: "fdsfds", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signin()) // user2 trying to update the ticket
    .send({ title: "fjdswlsorgd", price: 1000 })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const cookie = signin();
  // creating ticket and capturing the response to get the id after creation
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie) // user1 creates ticket
    .send({ title: "fdsfds", price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) // user1 trying to update the ticket
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie) // user1 trying to update the ticket
    .send({ title: "treoytr", price: -10 })
    .expect(400);
});

it("updates the ticket provided valid inputs", async () => {
  const cookie = signin();
  // creating ticket and capturing the response to get the id after creation
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie) // user1 creates ticket
    .send({ title: "fdsfds", price: 20 });

  // Update the ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  // Verify the update occured
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("new title");
  expect(ticketResponse.body.price).toEqual(100);
});

// Making sure that the mock nats-wrapper publish function is called
it("publishes an event", async () => {
  const cookie = signin();
  // creating ticket and capturing the response to get the id after creation
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie) // user1 creates ticket
    .send({ title: "fdsfds", price: 20 });

  // Update the ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

// Ticket cannot be updated when order reserves it
it("rejects updates if the ticket is reserved", async () => {
  const cookie = signin();
  // creating ticket and capturing the response to get the id after creation
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie) // user1 creates ticket
    .send({ title: "fdsfds", price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  // Workaround for adding a orderId property
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  // Update the ticket
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "new title",
      price: 100,
    })
    .expect(400);

  // expect(natsWrapper.client.publish).toHaveBeenCalled();
});
