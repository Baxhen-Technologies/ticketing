import { AxiosInstance } from 'axios';
import { NextPageContext } from 'next';
import Link from 'next/link';
import { UserResponse } from './auth/signup';

export const LandingPage = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    );
  });
  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  );
};

LandingPage.getInitialProps = async (
  context: NextPageContext,
  client: AxiosInstance,
  currentUser: UserResponse
): Promise<{ tickets: any[] }> => {
  const { data } = await client.get('/api/tickets');
  return { tickets: data };
};

export default LandingPage;
