import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { id: "desc" },
    include: { User: true, Seat: true },
  });

  return (
    <main>
      <h1>Bookings</h1>
      {bookings.length === 0 ? (
        <p>No bookings.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Id</th>
              <th>Seat</th>
              <th>Passenger</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.Seat.seatNumber}</td>
                <td>{booking.User.email || booking.User.name}</td>
                <td>{booking.bookingDate.toISOString()}</td>
                <td>{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
