import { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import Router from 'next/router';

import useRequest from '../../hooks/use-request';
import { NewTicketResponse } from './new';

interface CreateOrderBody {
  ticketId: string;
}
export interface CreateOrderResponse {
  expiresAt: string;
  id: string;
  status: string;
  ticket: NewTicketResponse;
  userId: string;
  version: number;
}

const TicketShow = ({ ticket }) => {
  const { doRequest, errors } = useRequest<
    CreateOrderBody,
    CreateOrderResponse
  >({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });

  return (
    <div>
      <h1>{ticket.title}</h1>
      <h4>Price: {ticket.price}</h4>
      {errors.map(({ message, field }) => (
        <div key={field} className="alert alert-danger">
          <ul>
            <li>{message}</li>
          </ul>
        </div>
      ))}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

TicketShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance
) => {
  const { ticketId } = context.query;

  const { data } = await client.get(`/api/tickets/${ticketId}`);

  return { ticket: data };
};

export default TicketShow;
