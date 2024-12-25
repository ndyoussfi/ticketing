import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from "@ndytickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
