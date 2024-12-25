import nats from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/ticket-created-listener";

console.clear();

// stan (nats backwards) is what NATS calls a client
const stan = nats.connect("ticketing", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

// we wait for stan to successfully connect to our nats streaming server
// connect event is emitted once connection is successful
stan.on("connect", () => {
  console.log("Listener connected to NATS");

  // tells NATS that im stopping and to stop sending me events and not attempt with me twice.
  stan.on("close", () => {
    console.log("NATS connection closed");
    process.exit(); // kick me out and don't do anything else.
  });

  new TicketCreatedListener(stan).listen();
});

// events handlers watch for interrupt signals and terminate signals
process.on("SIGINT", () => stan.close()); // interrupt signal
process.on("SIGTERM", () => stan.close()); // terminate signal
