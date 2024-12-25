import {
  ExpirationCompleteEvent,
  Listener,
  OrderStatus,
  Subjects,
} from "@ndytickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
    // We need to find the corresponding order
    const order = await Order.findById(data.orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    // Checks if the order has already been paid for, prior to the expiration
    if (order.status === OrderStatus.Complete) {
      // return early to prevent cancellation
      return msg.ack();
    }

    // change the status of the order to cancelled since the order is expired
    // also, this ensures that the ticket is no longer reserved using the isReserved property
    // once the ticket is no longer reserved, it will be released for updates or new orders
    order.set({
      status: OrderStatus.Cancelled,
    });

    // save the order
    await order.save();

    // inform the other services that this order got cancelled
    await new OrderCancelledPublisher(this.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    // acknowledge to NATS
    msg.ack();
  }
}
