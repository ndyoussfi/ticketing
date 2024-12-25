import { TicketCreatedEvent, Subjects, Publisher } from "@ndytickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
