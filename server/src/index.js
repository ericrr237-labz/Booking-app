// server/src/index.js (ESM)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import twilio from "twilio";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";




dotenv.config();

const app = express();
const prisma = new PrismaClient();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


app.use(cors());
app.use(express.json());
app.use(cookieParser());

function signToken() {
  return jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : (req.cookies.token || null);
  if (!token) return res.status(401).json({ ok:false, error:"Unauthorized" });
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ ok:false, error:"Invalid token" });
  }
}


app.post("/api/admin/login", (req, res) => {
  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok:false, error:"Wrong password" });
  }
  const token = signToken();
  // send both as JSON & cookie so you can use either
  res.cookie("token", token, { httpOnly: true, sameSite: "lax", maxAge: 7*24*60*60*1000 });
  res.json({ ok:true, token });
});


app.post('/api/bookings', async (req, res) => {
  try {
    const { name, phone, email, service, datetime, notes } = req.body;

    if (!name || !phone || !service || !datetime) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }

    // TODO: Save to your DB here
    res.json({ ok: true, message: 'Booking created successfully!' });
  } catch (err) {
    console.error('[POST /api/bookings] error:', err);
    res.status(500).json({ ok: false, error: 'booking_failed' });
  }
});

// Health check
app.get("/", (_req, res) => {
  res.json({ ok: true, service: "booking-api" });
});
// PUBLIC: find upcoming appointments by last name + last 4 of phone
app.get("/api/bookings/public", async (req, res) => {
  try {
    let { lastName, last4 } = req.query;
    if (!lastName || !last4) {
      return res.status(400).json({ ok: false, error: "Missing lastName or last4" });
    }

    lastName = String(lastName).trim().toLowerCase();
    last4 = String(last4).replace(/\D/g, "");
    if (last4.length !== 4) {
      return res.status(400).json({ ok: false, error: "Last 4 must be 4 digits" });
    }

    const now = new Date();

    // 1) DB filter by phone last4 and upcoming only (fast)
    const candidates = await prisma.booking.findMany({
      where: {
        AND: [
          { phone: { endsWith: last4 } },   // works with SQLite
          { startAt: { gte: now } },
        ],
      },
      orderBy: { startAt: "asc" },
      select: { id: true, name: true, service: true, startAt: true, notes: true },
    });

    // 2) Case-insensitive last-name match in JS (SQLite lacks insensitive contains)
    const bookings = candidates.filter((b) => {
      const parts = String(b.name || "").trim().toLowerCase().split(/\s+/);
      const ln = parts[parts.length - 1] || "";
      return ln === lastName;
    });

    return res.json({ ok: true, bookings });
  } catch (e) {
    console.error("[/api/bookings/public] error:", e);
    return res.status(500).json({ ok: false, error: "Failed to fetch" });
  }
});

// List bookings
app.get("/api/bookings", async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { startAt: "asc" },
    });
    res.json({ ok: true, bookings });
  } catch (e) {
    console.error("[/api/bookings GET] error:", e);
    res.status(500).json({ ok: false, error: "Failed to fetch bookings" });
  }
});


// Create booking

app.put("/api/bookings/:id", async (req, res) => {
  try {
    
    console.log("[/api/bookings] body =", req.body);
    const id = Number(req.params.id);
    const { name, email, phone, service, notes, startAt } = req.body;

    if (!name)    return res.status(400).json({ ok:false, error:"Missing name" });
    if (!service) return res.status(400).json({ ok:false, error:"Missing service" });
    if (!startAt) return res.status(400).json({ ok:false, error:"Missing startAt" });

    // Normalize phone to E.164 (+1XXXXXXXXXX) if provided
    const toE164 = (p) => {
      if (!p) return null;
      const digits = String(p).replace(/\D/g, "");
      if (digits.length === 10) return `+1${digits}`;
      if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
      if (String(p).startsWith("+")) return p;
      return null;
    };
    const phoneE164 = toE164(phone);

    const booking = await prisma.booking.create({
      data: {
        name,
        email: email ?? null,
        phone: phoneE164,                 // <- use normalized phone (or null)
        service,                          // <- use the value sent by the client
        notes: notes ?? "",
        startAt: new Date(startAt),
      },
      select: { id: true },
    });

    // Try SMS only if phone is valid; ignore SMS failures so booking still succeeds
    if (phoneE164) {
      try {
        const msg = await twilioClient.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneE164,
          body: `ericfadezz: Hey ${name}, your ${service} is booked for ${new Date(startAt).toLocaleString()}. Reply STOP to opt out, HELP for help.`,
        });
        console.log("[SMS] sid:", msg.sid);
      } catch (smsErr) {
        console.warn("[SMS] failed:", smsErr?.message || smsErr);
      }
    }

    return res.status(201).json({ ok:true, id: booking.id });
  } catch (e) {
    console.error("[/api/bookings] error:", e);
    return res.status(500).json({ ok:false, error:"Server error" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
