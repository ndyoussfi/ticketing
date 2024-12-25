import { Publisher, OrderCancelledEvent, Subjects } from "@ndytickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
