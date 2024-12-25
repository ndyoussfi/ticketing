import { PaymentCreatedEvent, Publisher, Subjects } from "@ndytickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
