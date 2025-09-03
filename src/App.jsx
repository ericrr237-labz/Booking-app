import { BrowserRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import Home from "./Pages/Home.jsx";
import Book from "./Pages/Book.jsx";
import Appointments from "./Pages/Appointments.jsx";
import Login from "./Pages/Login.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f1115] text-white">
        <header className="sticky top-0 z-20 order-b border-white/10 bg-black/30 backdrop-blur">
          <div className="mx-auto flex max-w-10xl items-center justify-between px-6 py-4">
            <Link to="/" className="text-lg font-semibold tracking-tight">ericfadezz</Link>
            <nav className="flex items-center gap-5 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) => isActive ? "text-white" : "text-slate-300 hover:text-white"}
              >Home</NavLink>
              <Link
                to="/book"
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700"
              >Book Now</Link>
               <Link to="/appointments" 
               className="rounded-xl bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700">
               
              Appointments
            </Link>
            </nav>
          </div>
        </header>
     <main className="bg-[#0f1115] text-white">
        <div className="mx-auto max-w-7xl px-6">

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/login" element={<Login />} />
          <Route path="/appointments" element={<Appointments />} /> 
        </Routes>
          </div>
      </main>   

    
      </div>
    </BrowserRouter>
  );
}
