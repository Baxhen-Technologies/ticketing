import { Publisher, Subjects, OrderCancelledEvent } from '@bxtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
