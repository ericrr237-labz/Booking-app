import { useState } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function Login() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API}/api/admin/login`, { password });
      localStorage.setItem("admintoken", data.token); // keep simple
      window.location.href = "/appointments";
    } catch (e) {
      setErr(e?.response?.data?.error || "Login failed");
    }
  }

  return (
    <main className="min-h-screen bg-[#0f1115] text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-3 max-w-sm">
        <input
          className="w-full rounded-lg bg-white/10 p-3"
          type="password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          placeholder="Admin password"
        />
        {err && <div className="text-rose-400 text-sm">{err}</div>}
        <button className="rounded-lg bg-blue-600 px-4 py-2">Sign in</button>
      </form>
    </main>
  );
}
