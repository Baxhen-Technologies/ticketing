import { Publisher, Subjects, TicketCreatedEvent } from '@bxtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
