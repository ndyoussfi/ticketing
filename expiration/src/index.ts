import { natsWrapper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined.");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined.");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined.");
  }

  try {
    // Connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // GRACEFUL SHUTDOWN
    // tells NATS that im stopping and to stop sending me events and not attempt with me twice.
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed");
      process.exit();
    });
    // events handlers watch for interrupt signals and terminate signals
    process.on("SIGINT", () => natsWrapper.client.close()); // interrupt signal
    process.on("SIGTERM", () => natsWrapper.client.close()); // terminate signal

    // Listeners
    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
