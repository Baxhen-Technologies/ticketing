import { Publisher, Subjects, TicketUpdatedEvent } from '@bxtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
