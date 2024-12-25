import { Ticket } from "../ticket";

it("implements optimistic concurrency control", async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 5,
    userId: "123",
  });

  // save the ticket to the database
  await ticket.save(); // version property is now assigned

  // fetch the ticket twice, both instances will have the same version property
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  // make two separate changes to the tickets we fetched
  firstInstance!.set({
    price: 10,
  });
  secondInstance!.set({
    price: 15,
  });

  // save the first fetched ticket
  await firstInstance!.save();

  // save the second fetched ticket and expect an error
  try {
    await secondInstance!.save(); // errors out because version property is outdated
  } catch (error) {
    return;
  }

  throw new Error("Should not reach this point");
});

it("increments the version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    userId: "123",
  });

  await ticket.save(); // version number is now 0
  expect(ticket.version).toEqual(0);

  // increment version number
  await ticket.save(); // version number is now 1
  expect(ticket.version).toEqual(1);

  // increment version number again
  await ticket.save(); // version number is now 2
  expect(ticket.version).toEqual(2);
});
