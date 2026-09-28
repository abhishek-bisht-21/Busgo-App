"use client";

import { useMemo, useState } from "react";
import type { SeatResult } from "@/lib/booking";

type SeatMapProps = {
  seats: SeatResult[];
  fare: number;
  initialSelectedIds?: number[];
  onProceed: (seatIds: number[]) => Promise<void> | void;
  proceeding?: boolean;
  proceedError?: string | null;
};

export function SeatMap({
  seats,
  fare,
  initialSelectedIds = [],
  onProceed,
  proceeding = false,
  proceedError = null,
}: SeatMapProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);

  const selected = useMemo(
    () => seats.filter((seat) => selectedIds.includes(seat.id) && !seat.isBooked),
    [seats, selectedIds],
  );
  const total = selected.length * fare;

  function toggleSeat(seat: SeatResult) {
    if (seat.isBooked) return;
    setSelectedIds((current) =>
      current.includes(seat.id)
        ? current.filter((id) => id !== seat.id)
        : [...current, seat.id],
    );
  }

  return (
    <section className="rise-in space-y-5 rounded-3xl border border-[#c81d25]/15 bg-white/80 p-5 shadow-xl shadow-[#c81d25]/10">
      <div className="mx-auto max-w-sm rounded-t-3xl bg-[#8e1018] px-4 py-3 text-center text-xs tracking-[0.2em] text-[#f8d7a8]">
        FRONT
      </div>
      <div className="grid grid-cols-4 gap-3">
        {seats.map((seat, index) => {
          const isSelected = selected.some((item) => item.id === seat.id);
          return (
            <button
              key={seat.id}
              type="button"
              disabled={seat.isBooked}
              aria-pressed={isSelected}
              onClick={() => toggleSeat(seat)}
              style={{ animationDelay: `${index * 40}ms` }}
              className={
                seat.isBooked
                  ? "h-14 rounded-2xl bg-zinc-300 text-zinc-500 line-through disabled:cursor-not-allowed"
                  : isSelected
                    ? "seat-pop h-14 rounded-2xl bg-[#c81d25] font-semibold text-white shadow-lg shadow-[#c81d25]/30"
                    : "rise-in h-14 rounded-2xl border border-[#c81d25]/20 bg-[#fff8f3] font-semibold text-[#8e1018] transition hover:-translate-y-0.5 hover:border-[#c81d25]"
              }
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#6b3033]">
          {selected.length === 0
            ? "Select a seat to continue"
            : `${selected.length} selected · ₹${total}`}
        </p>
        <button
          type="button"
          disabled={selected.length === 0 || proceeding}
          onClick={() => onProceed(selected.map((seat) => seat.id))}
          className="h-12 rounded-full bg-[#c81d25] px-6 font-semibold text-white shadow-lg shadow-[#c81d25]/30 transition enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#c81d25]/35"
        >
          {proceeding ? "Booking..." : selected.length === 0 ? "Proceed" : `Proceed · ₹${total}`}
        </button>
      </div>
      {proceedError ? <p className="text-sm text-[#c81d25]">{proceedError}</p> : null}
    </section>
  );
}
