import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import useRequest from "../../hooks/use-request";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const { doRequest, errors } = useRequest({
    url: "/api/payments",
    method: "post",
    body: {
      orderId: order.id,
    },
    onSuccess: () => Router.push("/orders"),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    // calling findTimeLeft once, then once every second
    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    // useEffect's return function get calls when navigating away from this component
    // or when stop rendering this component
    return () => {
      clearInterval(timerId); // Stops
    };
  }, [order]);

  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51QXfEbLBmxS6YdVGq4cdrVFcvReSHOof47VRiBld017fhRmBkc2tqCY9QPOStImvS6JMQ15oWc2aIL0MheXZaKwg00VT5AMgWb"
        amount={order.ticket.price * 100} // converting to cents
        email={currentUser.email}
      />
      {errors}
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
