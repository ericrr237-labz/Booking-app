import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "";
console.log("API =", import.meta.env.VITE_API_URL);

const SERVICES = [
  { id: "house_call", label: "House Call", price: 50, durationMin: 60 },
  { id: "regular_cut", label: "Regular Cut", price: 25, durationMin: 45 },
  { id: "regular_cut+beard", label: "Regular Cut + Beard", price: 30, durationMin: 60 },
  { id: "regular_cut+design", label: "Regular Cut + Design", price: 35, durationMin: 60 },
];

function toUtcStamp(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function buildICS({ id, title, description, start, end, location }) {
  const dtstamp = toUtcStamp(new Date());
  const dtstart = toUtcStamp(start);
  const dtend = toUtcStamp(end);
  const sanitizedDesc = (description || "").replace(/\n/g, "\\n");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ericfadezz//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${id}@ericfadezz.local`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${sanitizedDesc}`,
    location ? `LOCATION:${location}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}

function buildGoogleUrl({ title, details, start, end, location }) {
  const base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
  const dates = `${toUtcStamp(start)}/${toUtcStamp(end)}`;
  const params = new URLSearchParams({
    text: title,
    details: details || "",
    dates,
    location: location || "",
  });
  return `${base}&${params.toString()}`;
}

export default function Book() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { service: SERVICES[0].id } });

  const [status, setStatus] = useState("");
  const [icsLink, setIcsLink] = useState("");
  const [gcalLink, setGcalLink] = useState("");

  const selectedId = watch("service");
  const selected = useMemo(() => SERVICES.find((s) => s.id === selectedId) || SERVICES[0], [selectedId]);

  const onSubmit = async (values) => {
    setStatus("");
    setIcsLink("");
    setGcalLink("");

    const start = new Date(values.startAt);
    const end = new Date(start.getTime() + selected.durationMin * 60000);

    const payload = {
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      service: `${selected.label} ($${selected.price})`,
      notes: values.notes || null,
      startAt: start.toISOString(),
    };

    try {
      const { data } = await axios.post(`${API}/api/bookings`, payload);
      setStatus(`Booked #${data.id}. See you soon!`);

      const title = `${selected.label} with Eric`;
      const description = values.notes ? `Notes: ${values.notes}` : "";
      const location = selected.id === "house_call" ? "House Call" : "Barbershop";

      const ics = buildICS({ id: data.id, title, description, start, end, location });
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      setIcsLink(href);

      const gHref = buildGoogleUrl({ title, details: description, start, end, location });
      setGcalLink(gHref);

      reset({ service: selectedId });
    } catch (e) {
      console.error(e);
      setStatus("Booking failed. Try a different time or check your connection.");
    }
  };

  return (
    <motion.main
      className="min-h-screen bg-[#0f1115] text-white px-6 py-10"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="mt-1 text-slate-300">Pick a service and time. You’ll get instant confirmation.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-4">
          <fieldset className="rounded-2xl border border-white/10 p-4">
            <legend className="px-2 text-sm text-slate-300">Service</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
                    selectedId === s.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-sm">
                    <div className="font-semibold">{s.label}</div>
                    <div className="text-slate-300">${s.price} • {s.durationMin}m</div>
                  </div>
                  <input
                    type="radio"
                    value={s.id}
                    {...register("service", { required: true })}
                    className="accent-blue-500"
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Name</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500"
                placeholder="Your name"
                {...register("name", { required: true, minLength: 2 })}
              />
              {errors.name && <p className="mt-1 text-xs text-rose-400">Name is required</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Phone</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500"
                placeholder="(555) 123-4567"
                {...register("phone")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500"
                placeholder="you@email.com"
                type="email"
                {...register("email")}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Date & Time</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-blue-500"
                type="datetime-local"
                {...register("startAt", { required: true })}
              />
              {errors.startAt && (
                <p className="mt-1 text-xs text-rose-400">Please choose a date and time</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Notes (optional)</label>
            <textarea
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none placeholder:text-slate-400 focus:border-blue-500"
              rows={4}
              placeholder="Anything I should know? Gate code, style reference, etc."
              {...register("notes")}
            />
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="text-sm text-slate-300">Selected: <span className="font-semibold text-white">{selected.label}</span></div>
            <div className="text-lg font-semibold">${selected.price}</div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "Booking…" : "Confirm Booking"}
          </button>

          {!!status && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
              <div>{status}</div>
              <div className="flex flex-wrap gap-3">
                {icsLink && (
                  <a
                    href={icsLink}
                    download="booking.ics"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  >
                    Add to Apple/Outlook (ICS)
                  </a>
                )}
                {gcalLink && (
                  <a
                    href={gcalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
                  >
                    Add to Google Calendar
                  </a>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </motion.main>
  );
}
