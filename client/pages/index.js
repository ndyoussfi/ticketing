import Link from "next/link";

const Landing = ({ currentUser, tickets }) => {
  const ticketList = tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>{ticket.title}</td>
        <td>{ticket.price}</td>
        <td>
          <Link
            href="/tickets/[ticketId]"
            as={`/tickets/${ticket.id}`}
            legacyBehavior
          >
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

// Nextjs uses this function during server side rendering process
// We receive the client and current user from the AppComponent here
// because AppComponent invokes this getInitialProps, b/c this is a child of AppComponent
Landing.getInitialProps = async (context, client, currentUser) => {
  const { data } = await client.get("/api/tickets");

  return { tickets: data };
};

export default Landing;
