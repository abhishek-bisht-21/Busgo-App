export const SEAT_FARE = 499;

export type BusSearchResult = {
  id: number;
  busNumber: string;
  origin: string;
  destination: string;
  date: string;
  fare: number;
  seatCount: number;
  availableSeats: number;
};

export type SeatResult = {
  id: number;
  seatNumber: string;
  isBooked: boolean;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseTravelDate(value: string) {
  const date = value.trim();
  if (!datePattern.test(date)) {
    return null;
  }

  const start = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { date, start, end };
}

export function readTravelDate(url: URL) {
  return parseTravelDate(url.searchParams.get("date") ?? "");
}

export function readSearchParams(url: URL) {
  const from = url.searchParams.get("from")?.trim() ?? "";
  const to = url.searchParams.get("to")?.trim() ?? "";
  const travelDate = readTravelDate(url);
  if (!from || !to || !travelDate) {
    return null;
  }

  return { from, to, ...travelDate };
}

export function seatIsBooked(seat: {
  isBooked: boolean;
  Booking: { id: number }[];
}) {
  return seat.isBooked || seat.Booking.length > 0;
}
