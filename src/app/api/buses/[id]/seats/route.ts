import { prisma } from "@/lib/prisma";
import { SEAT_FARE, readTravelDate, seatIsBooked, type SeatResult } from "@/lib/booking";

export async function GET(
  request: Request,
  context: RouteContext<"/api/buses/[id]/seats">,
) {
  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id)) {
    return Response.json({ error: "Invalid bus id." }, { status: 400 });
  }

  const query = readTravelDate(new URL(request.url));
  if (!query) {
    return Response.json(
      { error: "date (YYYY-MM-DD) is required." },
      { status: 400 },
    );
  }

  const bus = await prisma.bus.findUnique({
    where: { id },
    include: {
      Seat: {
        orderBy: { seatNumber: "asc" },
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
  });

  if (!bus) {
    return Response.json({ error: "Bus not found." }, { status: 404 });
  }

  const seats: SeatResult[] = bus.Seat.map((seat) => ({
    id: seat.id,
    seatNumber: seat.seatNumber,
    isBooked: seatIsBooked(seat),
  }));

  return Response.json({
    busId: bus.id,
    busNumber: bus.busNumber,
    date: query.date,
    fare: SEAT_FARE,
    seats,
  });
}
