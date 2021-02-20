import { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import { CreateOrderResponse } from '../tickets/[ticketId]';

interface Props {
  orders: CreateOrderResponse[];
}

const OrderIndex = ({ orders }: Props) => {
  return (
    <ul>
      {orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

OrderIndex.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance
) => {
  const { data } = await client.get('/api/orders');

  return { orders: data };
};

export default OrderIndex;
