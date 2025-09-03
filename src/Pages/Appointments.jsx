import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

function classNames(...xs){ return xs.filter(Boolean).join(" "); }

export default function Appointments() {
  const [tab, setTab] = useState("client"); // 'client' | 'admin'

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Appointments</h1>

      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 overflow-hidden">
        {["client","admin"].map(t => (
          <button
            key={t}
            onClick={()=>setTab(t)}
            className={classNames(
              "px-4 py-2 text-sm",
              tab===t ? "bg-blue-600" : "hover:bg-white/10"
            )}
          >
            {t === "client" ? "Client" : "Admin"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "client" ? <ClientView /> : <AdminView />}
      </div>
    </main>
  );
}

/* ---------- CLIENT VIEW: lookup by phone (public) ---------- */
function ClientView() {
  const [lastName, setLastName] = useState("");
  const [last4, setLast4] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [bookings, setBookings] = useState([]);

  async function search(e){
    e?.preventDefault();
    setErr(""); setLoading(true); setBookings([]);
    try {
      const { data } = await axios.get(`${API}/api/bookings/public`, {
        params: { lastName, last4 }
      });
      setBookings(data.bookings || []);
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="max-w-xl">
      <form onSubmit={search} className="grid gap-3 sm:grid-cols-3">
        <input
          className="rounded-lg bg-white/10 p-3 sm:col-span-2"
          placeholder="Last name (e.g., Reyes)"
          value={lastName}
          onChange={(e)=>setLastName(e.target.value)}
        />
        <input
          className="rounded-lg bg-white/10 p-3"
          placeholder="Last 4 of phone"
          value={last4}
          onChange={(e)=>setLast4(e.target.value.replace(/\D/g,"").slice(0,4))}
        />
        <button className="rounded-lg bg-blue-600 px-4 py-2 sm:col-span-3">Find</button>
      </form>

      {loading && <p className="mt-4 text-slate-300">Searching…</p>}
      {err && <p className="mt-4 text-rose-400">Error: {err}</p>}

      <ul className="mt-6 space-y-3">
        {bookings.map(b => (
          <li key={b.id} className="border border-white/10 rounded-xl p-4 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{b.service}</div>
              <div className="text-sm text-slate-400">#{b.id}</div>
            </div>
            <div className="text-slate-300 mt-1">{new Date(b.startAt).toLocaleString()}</div>
            {b.notes && <div className="text-sm text-slate-400 mt-1">Notes: {b.notes}</div>}
          </li>
        ))}
        {!loading && bookings.length === 0 && !err && (
          <p className="text-slate-300">No upcoming appointments found. Check spelling and last 4 digits.</p>
        )}
      </ul>
    </section>
  );
}

/* ---------- ADMIN VIEW: auth + list + inline edit ---------- */
function AdminView() {
  const [token, setToken] = useState(() => localStorage.getItem("admintoken") || "");
  const [password, setPassword] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const headers = useMemo(
    () => token ? { Authorization: `Bearer ${token}` } : {},
    [token]
  );

  async function login(e){
    e.preventDefault();
    setErr("");
    try {
      const { data } = await axios.post(`${API}/api/admin/login`, { password });
      localStorage.setItem("admintoken", data.token);
      setToken(data.token);
      setPassword("");
      await fetchBookings();
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    }
  }

  async function fetchBookings(){
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/bookings`, { headers });
      setBookings((data.bookings || []).sort((a,b)=>new Date(a.startAt)-new Date(b.startAt)));
    } catch (e) {
      setErr(e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); /* eslint-disable-next-line */ }, [token]);

  async function save(b){
    setErr("");
    await axios.put(`${API}/api/bookings/${b.id}`, {
      name: b.name, email: b.email, phone: b.phone,
      service: b.service, notes: b.notes, startAt: b.startAt, status: b.status || "Pending"
    }, { headers });
    await fetchBookings();
  }

  if (!token) {
    return (
      <section className="max-w-sm">
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            className="w-full rounded-lg bg-white/10 p-3"
            placeholder="Admin password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          {err && <div className="text-rose-400 text-sm">{err}</div>}
          <button className="rounded-lg bg-blue-600 px-4 py-2">Sign in</button>
        </form>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <button onClick={fetchBookings} className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20">
          Refresh
        </button>
        <button
          className="rounded-lg bg-white/10 px-3 py-2 hover:bg-white/20"
          onClick={()=>{ localStorage.removeItem("admintoken"); setToken(""); }}
        >
          Sign out
        </button>
      </div>

      {loading && <p className="text-slate-300">Loading…</p>}
      {err && <p className="text-rose-400">{err}</p>}

      <ul className="space-y-3">
        {bookings.map(b => (
          <li key={b.id} className="border border-white/10 rounded-xl p-4 bg-white/5 grid gap-3 md:grid-cols-2">
            <input className="bg-white/10 p-2 rounded" value={b.name||""}
                   onChange={e=>updateLocal(setBookings, b.id, { name:e.target.value })}/>
            <input className="bg-white/10 p-2 rounded" value={b.phone||""}
                   onChange={e=>updateLocal(setBookings, b.id, { phone:e.target.value })}/>
            <input className="bg-white/10 p-2 rounded" value={b.email||""}
                   onChange={e=>updateLocal(setBookings, b.id, { email:e.target.value })}/>
            <input className="bg-white/10 p-2 rounded" value={b.service||""}
                   onChange={e=>updateLocal(setBookings, b.id, { service:e.target.value })}/>
            <input type="datetime-local"
                   className="bg-white/10 p-2 rounded"
                   value={new Date(b.startAt).toISOString().slice(0,16)}
                   onChange={e=>updateLocal(setBookings, b.id, { startAt:new Date(e.target.value).toISOString() })}/>
            <input className="bg-white/10 p-2 rounded md:col-span-2" value={b.notes||""}
                   onChange={e=>updateLocal(setBookings, b.id, { notes:e.target.value })}/>

            <div className="md:col-span-2 flex gap-2 justify-end">
              <button onClick={()=>save(b)} className="bg-blue-600 px-3 py-2 rounded">Save</button>
            </div>
          </li>
        ))}
      </ul>
      {bookings.length === 0 && !loading && !err && (
        <p className="text-slate-300">No bookings yet.</p>
      )}
    </section>
  );
}

function updateLocal(setter, id, patch){
  setter(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
}
