import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
import { natsWrapper } from "../nats-wrapper";

// Recommended: Payload tells Typescript what kind of information will flow in the Queue
interface Payload {
  orderId: string;
}

// Expiration Queue allows us to publish a Job and process a Job as well
// Nothing special about the queue name: order:expiration, can be anything
const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST, // Host name in depl file
  },
});

// Processes the Jobs sent from Redis server
// Job objects are similar to Message objects, they wrap the data we provide it with
// The data containing the orderId property is defined above in our Payload interface
expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
