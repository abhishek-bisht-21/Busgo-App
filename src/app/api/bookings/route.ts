import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SEAT_FARE, parseTravelDate } from "@/lib/booking";

type BookingRequest = {
  busId?: number;
  date?: string;
  seatIds?: number[];
};

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return Response.json({ error: "Sign in to book these seats." }, { status: 401 });
  }

  const body = (await request.json()) as BookingRequest;
  const seatIds = Array.isArray(body.seatIds)
    ? [...new Set(body.seatIds.filter((id) => Number.isInteger(id)))]
    : [];
  const travelDate = parseTravelDate(body.date ?? "");

  if (!Number.isInteger(body.busId) || !travelDate || seatIds.length === 0) {
    return Response.json(
      { error: "busId, date, and at least one seat are required." },
      { status: 400 },
    );
  }

  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds }, busId: body.busId },
    include: {
      Booking: {
        where: {
          status: { in: ["pending", "confirmed"] },
          bookingDate: { gte: travelDate.start, lt: travelDate.end },
        },
        select: { id: true },
      },
    },
  });

  if (seats.length !== seatIds.length || seats.some((seat) => seat.isBooked || seat.Booking.length > 0)) {
    return Response.json({ error: "One of those seats is no longer available." }, { status: 409 });
  }

  const email = session.user.email;
  const rider = await prisma.user.upsert({
    where: { email },
    update: { name: session.user.name },
    create: {
      email,
      name: session.user.name,
      password: "managed-by-better-auth",
      loginId: email,
      emailVerified: Boolean(session.user.emailVerified),
      updatedAt: new Date(),
    },
  });

  const bookingDate = new Date(`${travelDate.date}T09:00:00.000Z`);
  const now = new Date();
  await prisma.$transaction([
    prisma.booking.createMany({
      data: seats.map((seat) => ({
        bookingDate,
        status: "confirmed",
        userId: rider.id,
        seatId: seat.id,
        updatedAt: now,
      })),
    }),
    prisma.seat.updateMany({
      where: { id: { in: seats.map((seat) => seat.id) } },
      data: { isBooked: true, updatedAt: now },
    }),
  ]);

  return Response.json({
    booked: seats.map((seat) => seat.seatNumber),
    total: seats.length * SEAT_FARE,
    date: travelDate.date,
  });
}
