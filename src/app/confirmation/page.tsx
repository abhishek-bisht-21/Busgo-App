import Link from "next/link";

type ConfirmationSearchParams = {
  seats?: string | string[];
  total?: string | string[];
  date?: string | string[];
};

function firstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function seatList(value: string) {
  return value
    .split(",")
    .map((seat) => seat.trim())
    .filter(Boolean);
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<ConfirmationSearchParams>;
}) {
  const params = await searchParams;
  const seats = seatList(firstParam(params.seats));
  const totalRaw = firstParam(params.total);
  const date = firstParam(params.date);
  const total = Number(totalRaw);
  const totalLabel = Number.isFinite(total) && totalRaw !== "" ? `₹${total}` : "—";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 px-5 py-16">
      <section className="rise-in overflow-hidden rounded-[2rem] bg-[#8e1018] px-6 py-8 text-white shadow-2xl shadow-[#8e1018]/30 sm:px-10">
        <p className="text-sm tracking-[0.25em] text-[#f8d7a8]">BUSGO</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">You&apos;re booked.</h1>
        <p className="mt-3 max-w-lg text-[#ffd7d4]">
          {date ? `Travel date ${date}.` : "Your seats are reserved."} Hold onto this confirmation.
        </p>
      </section>

      <section
        className="rise-in rounded-3xl border border-[#c81d25]/15 bg-white/85 p-6 shadow-lg shadow-[#c81d25]/10"
        style={{ animationDelay: "80ms" }}
      >
        <h2 className="text-sm tracking-[0.18em] text-[#8e1018]">SEATS</h2>
        {seats.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {seats.map((seat) => (
              <li
                key={seat}
                className="rounded-full bg-[#c81d25] px-4 py-2 text-sm font-semibold text-white shadow-md shadow-[#c81d25]/25"
              >
                {seat}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[#6b3033]">No seat numbers were included.</p>
        )}

        <div className="mt-8 border-t border-[#c81d25]/15 pt-6">
          <p className="text-sm tracking-[0.18em] text-[#8e1018]">TOTAL</p>
          <p className="mt-2 text-4xl font-semibold text-[#2a1214]">{totalLabel}</p>
          {date ? <p className="mt-2 text-sm text-[#6b3033]">{date}</p> : null}
        </div>
      </section>

      <Link
        href="/"
        className="rise-in inline-flex h-12 w-fit items-center rounded-full bg-[#c81d25] px-6 font-semibold text-white shadow-md shadow-[#c81d25]/30 transition hover:-translate-y-0.5"
        style={{ animationDelay: "160ms" }}
      >
        Back home
      </Link>
    </main>
  );
}
