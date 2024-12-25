import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

// stan (nats backwards) is what NATS calls a client
const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

// we wait for stan to successfully connect to our nats streaming server
// connect event is emitted once connection is successful
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: "123",
      title: "concert",
      price: 20,
    });
  } catch (err) {
    console.error(err);
  }
  // // information we want to share
  // // NOTE: WE CANNOT SHARE A PLAIN OBJECT DIRECTLY, HAS TO BE CONVERTED TO JSON
  // const data = JSON.stringify({
  //   id: "123",
  //   title: "concert",
  //   price: '$20',
  // });

  // // this is how we publish,
  // // 1st arg - ticket:created is the subject name
  // // 2nd arg - data (message) is the information we want the share
  // // 3rd arg - callback function to do something after
  // stan.publish("ticket:created", data, () => {
  //   // callback function invoked after we publish this data (message) to the channel
  //   console.log("Event published");
  // });
});
