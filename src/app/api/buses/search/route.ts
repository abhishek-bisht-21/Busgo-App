import { prisma } from "@/lib/prisma";
import {
  SEAT_FARE,
  readSearchParams,
  seatIsBooked,
  type BusSearchResult,
} from "@/lib/booking";

export async function GET(request: Request) {
  const query = readSearchParams(new URL(request.url));
  if (!query) {
    return Response.json(
      { error: "from, to, and date (YYYY-MM-DD) are required." },
      { status: 400 },
    );
  }

  const routes = await prisma.route.findMany({
    where: {
      origin: { equals: query.from, mode: "insensitive" },
      destination: { equals: query.to, mode: "insensitive" },
    },
    include: {
      Bus: {
        include: {
          Seat: {
            include: {
              Booking: {
                where: {
                  status: { in: ["pending", "confirmed"] },
                  bookingDate: { gte: query.start, lt: query.end },
                },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { busNumber: "asc" },
      },
    },
  });

  const buses: BusSearchResult[] = routes.flatMap((route) =>
    route.Bus.map((bus) => {
      const booked = bus.Seat.filter(seatIsBooked).length;
      return {
        id: bus.id,
        busNumber: bus.busNumber,
        origin: route.origin,
        destination: route.destination,
        date: query.date,
        fare: SEAT_FARE,
        seatCount: bus.Seat.length,
        availableSeats: bus.Seat.length - booked,
      };
    }),
  );

  return Response.json({ buses });
}
