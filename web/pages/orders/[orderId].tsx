import { useState, useEffect } from 'react';
import { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import Router from 'next/router';

import { CreateOrderResponse } from '../tickets/[ticketId]';
import StripeCheckout from 'react-stripe-checkout';
import { UserResponse } from '../auth/signup';
import useRequest from '../../hooks/use-request';

interface Props {
  order: CreateOrderResponse;
  currentUser: UserResponse;
}

interface NewPaymentBody {
  orderId: string;
}
interface NewPaymentProps {
  token: string;
}
interface NewPaymentResponse {
  id: string;
}

const OrderShow = ({ order, currentUser }: Props) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest<
    NewPaymentBody,
    NewPaymentResponse,
    NewPaymentProps
  >({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt).getTime() - new Date().getTime();

      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      {errors.map(({ message, field }) => (
        <div key={field} className="alert alert-danger">
          <ul>
            <li>{message}</li>
          </ul>
        </div>
      ))}
      <StripeCheckout
        token={({ id: token }) => doRequest({ token })}
        stripeKey={process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance
) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);
  return { order: data };
};

export default OrderShow;
