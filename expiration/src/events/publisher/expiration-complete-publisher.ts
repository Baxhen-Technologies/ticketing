import {
  Publisher,
  ExpirationCompleteEvent,
  Subjects,
} from '@bxtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
