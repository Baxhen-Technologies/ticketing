import { Publisher, Subjects, OrderCreatedEvent } from '@bxtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
