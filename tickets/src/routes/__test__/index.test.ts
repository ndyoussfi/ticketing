import request from "supertest";
import { app } from "../../app";

const createTicket = () => {
  return request(app).post("/api/tickets").set("Cookie", signin()).send({
    title: "fsdfsd",
    price: 20,
  });
};

it("can fetch a list of tickets", async () => {
  // Simulate creation of 3 tickets to fetch them back
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(3);
});
