"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { SeatMap } from "@/components/seat-map";
import { authClient } from "@/lib/auth-client";
import type { BusSearchResult, SeatResult } from "@/lib/booking";

type SeatResponse = {
  busId: number;
  busNumber: string;
  date: string;
  fare: number;
  seats: SeatResult[];
};

const holdKey = "busgo-hold";

export function BusSearch() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [buses, setBuses] = useState<BusSearchResult[]>([]);
  const [seatMap, setSeatMap] = useState<SeatResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [proceedError, setProceedError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [proceeding, setProceeding] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setProceedError(null);
    setConfirmation(null);
    setSeatMap(null);
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams({
      from: String(formData.get("from") ?? ""),
      to: String(formData.get("to") ?? ""),
      date: String(formData.get("date") ?? ""),
    });

    const response = await fetch(`/api/buses/search?${params.toString()}`);
    const body = (await response.json()) as { buses?: BusSearchResult[]; error?: string };
    setPending(false);
    setSearched(true);

    if (!response.ok) {
      setBuses([]);
      setError(body.error ?? "Search failed.");
      return;
    }

    setBuses(body.buses ?? []);
  }

  async function openSeats(bus: BusSearchResult) {
    setError(null);
    setProceedError(null);
    setConfirmation(null);
    const params = new URLSearchParams({ date: bus.date });
    const response = await fetch(`/api/buses/${bus.id}/seats?${params.toString()}`);
    const body = (await response.json()) as SeatResponse & { error?: string };
    if (!response.ok) {
      setError(body.error ?? "Could not load seats.");
      return;
    }
    setSeatMap(body);
  }

  async function proceed(seatIds: number[]) {
    if (!seatMap) return;
    setProceedError(null);

    if (!session) {
      sessionStorage.setItem(
        holdKey,
        JSON.stringify({ busId: seatMap.busId, date: seatMap.date, seatIds }),
      );
      router.push("/login?next=/");
      return;
    }

    setProceeding(true);
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        busId: seatMap.busId,
        date: seatMap.date,
        seatIds,
      }),
    });
    const body = (await response.json()) as {
      booked?: string[];
      total?: number;
      date?: string;
      error?: string;
    };
    setProceeding(false);

    if (!response.ok) {
      setProceedError(body.error ?? "Booking failed.");
      return;
    }

    sessionStorage.removeItem(holdKey);
    const params = new URLSearchParams({
      seats: (body.booked ?? []).join(","),
      total: String(body.total ?? ""),
      date: body.date ?? seatMap.date,
    });
    router.push(`/confirmation?${params.toString()}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-5 py-10">
      <section className="rise-in relative overflow-hidden rounded-[2rem] bg-[#8e1018] px-6 py-10 text-white shadow-2xl shadow-[#8e1018]/30 sm:px-10">
        <p className="text-sm tracking-[0.25em] text-[#f8d7a8]">BUSGO</p>
        <h1 className="mt-2 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Red seats. Open roads.
        </h1>
        <p className="mt-3 max-w-lg text-[#ffd7d4]">
          Search a route, pick your seats, and proceed to book.
        </p>
        <div className="mt-8 h-16 overflow-hidden">
          <div className="bus-drive w-40">
            <div className="relative h-12 rounded-xl bg-[#c81d25] shadow-lg">
              <div className="absolute top-2 left-3 h-5 w-8 rounded bg-[#f8d7a8]" />
              <div className="absolute top-2 left-14 h-5 w-8 rounded bg-[#f8d7a8]" />
              <div className="absolute -bottom-2 left-4 h-4 w-4 rounded-full bg-[#2a1214]" />
              <div className="absolute -bottom-2 right-5 h-4 w-4 rounded-full bg-[#2a1214]" />
            </div>
          </div>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="rise-in grid gap-4 rounded-3xl border border-[#c81d25]/15 bg-white/80 p-5 shadow-lg shadow-[#c81d25]/10 sm:grid-cols-4"
      >
        <label className="flex flex-col gap-1 text-sm text-[#6b3033]">
          From
          <input
            name="from"
            required
            defaultValue="Delhi"
            className="h-12 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] px-3 outline-none transition focus:border-[#c81d25]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#6b3033]">
          To
          <input
            name="to"
            required
            defaultValue="Jaipur"
            className="h-12 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] px-3 outline-none transition focus:border-[#c81d25]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[#6b3033]">
          Date
          <input
            name="date"
            type="date"
            required
            defaultValue="2026-10-02"
            className="h-12 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] px-3 outline-none transition focus:border-[#c81d25]"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="h-12 self-end rounded-full bg-[#c81d25] font-semibold text-white shadow-md shadow-[#c81d25]/30 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {pending ? "Searching..." : "Search buses"}
        </button>
      </form>

      {error ? <p className="text-sm text-[#c81d25]">{error}</p> : null}
      {confirmation ? (
        <p className="rise-in rounded-2xl bg-[#8e1018] px-4 py-3 text-sm text-white">{confirmation}</p>
      ) : null}
      {searched && buses.length === 0 && !error ? (
        <p className="text-sm text-[#6b3033]">No buses found for that route.</p>
      ) : null}

      <ul className="flex flex-col gap-3">
        {buses.map((bus, index) => (
          <li
            key={bus.id}
            style={{ animationDelay: `${index * 70}ms` }}
            className="rise-in flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#c81d25]/15 bg-white/85 px-5 py-4 shadow-md shadow-[#c81d25]/10"
          >
            <div>
              <p className="text-lg font-semibold text-[#8e1018]">
                {bus.busNumber} · {bus.origin} to {bus.destination}
              </p>
              <p className="text-sm text-[#6b3033]">
                {bus.date} · {bus.availableSeats} of {bus.seatCount} seats open · ₹{bus.fare} each
              </p>
            </div>
            <button
              type="button"
              onClick={() => openSeats(bus)}
              className="h-11 rounded-full bg-[#2a1214] px-5 text-sm text-white transition hover:-translate-y-0.5"
            >
              Select seats
            </button>
          </li>
        ))}
      </ul>

      {seatMap ? (
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-[#8e1018]">
            {seatMap.busNumber} · {seatMap.date}
          </h2>
          <SeatMap
            seats={seatMap.seats}
            fare={seatMap.fare}
            onProceed={proceed}
            proceeding={proceeding}
            proceedError={proceedError}
          />
        </div>
      ) : null}
    </div>
  );
}
