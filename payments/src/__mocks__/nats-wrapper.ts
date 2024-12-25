// Mocks the nats-wrapper file containing a client Stan object
export const natsWrapper = {
  // Stan client publish Mock function
  client: {
    publish: jest
      .fn()
      .mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
