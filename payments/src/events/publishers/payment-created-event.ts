import { Publisher, Subjects, PaymentCreatedEvent } from '@bxtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
