import "dotenv/config";
import { prisma } from "../src/lib/prisma";

const travelDate = new Date("2026-10-01T09:00:00.000Z");

const rider = await prisma.user.upsert({
  where: { email: "rider@busgo.app" },
  update: {},
  create: {
    email: "rider@busgo.app",
    password: "not-used",
    loginId: "rider",
    name: "Sample Rider",
    emailVerified: true,
    updatedAt: new Date(),
  },
});

const route = await prisma.route.upsert({
  where: {
    origin_destination: { origin: "Delhi", destination: "Jaipur" },
  },
  update: {},
  create: {
    origin: "Delhi",
    destination: "Jaipur",
    updatedAt: new Date(),
  },
});

const bus = await prisma.bus.upsert({
  where: { busNumber: "BG-101" },
  update: {},
  create: {
    busNumber: "BG-101",
    routeId: route.id,
    updatedAt: new Date(),
  },
});

const seatNumbers = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4"];

for (const seatNumber of seatNumbers) {
  await prisma.seat.upsert({
    where: { busId_seatNumber: { busId: bus.id, seatNumber } },
    update: {},
    create: {
      busId: bus.id,
      seatNumber,
      isBooked: seatNumber === "A1",
      updatedAt: new Date(),
    },
  });
}

const heldSeat = await prisma.seat.findUniqueOrThrow({
  where: { busId_seatNumber: { busId: bus.id, seatNumber: "A2" } },
});

const existingHold = await prisma.booking.findFirst({
  where: { seatId: heldSeat.id, bookingDate: travelDate },
});

if (!existingHold) {
  await prisma.booking.create({
    data: {
      bookingDate: travelDate,
      status: "confirmed",
      userId: rider.id,
      seatId: heldSeat.id,
      updatedAt: new Date(),
    },
  });
}

console.log(`Seeded ${bus.busNumber} on ${route.origin} to ${route.destination}`);
