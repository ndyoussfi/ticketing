import { TicketUpdatedEvent, Subjects, Publisher } from "@ndytickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
