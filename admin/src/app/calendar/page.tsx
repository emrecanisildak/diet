"use client";

import { useEffect, useState } from "react";
import { appointments, users, Appointment, Client, AppointmentCreate, AppointmentUpdate } from "@/lib/api";
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<AppointmentCreate>({
    client_id: "",
    title: "",
    date_time: "",
    duration_minutes: 30,
    notes: "",
  });

  const loadData = async () => {
    try {
      const [a, c] = await Promise.all([appointments.list(), users.clients()]);
      setAppts(a);
      setClients(c);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointments.create(form);
      setShowCreate(false);
      setForm({ client_id: "", title: "", date_time: "", duration_minutes: 30, notes: "" });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediginize emin misiniz?")) return;
    try {
      await appointments.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointments.update(id, { status });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client?.full_name || "Bilinmeyen";
  };

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
  const daysInMonth = lastDay.getDate();

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getApptsForDay = (day: number) => {
    return appts.filter((a) => {
      const d = new Date(a.date_time);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const monthNames = [
    "Ocak", "Subat", "Mart", "Nisan", "Mayis", "Haziran",
    "Temmuz", "Agustos", "Eylul", "Ekim", "Kasim", "Aralik",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Takvim</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Yeni Randevu
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Yeni Randevu</h2>
              <button onClick={() => setShowCreate(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danisan</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                >
                  <option value="">Danisan secin</option>
                  {clients.filter((c) => c.status === "active").map((c) => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baslik</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tarih ve Saat</label>
                <input
                  type="datetime-local"
                  value={form.date_time}
                  onChange={(e) => setForm({ ...form, date_time: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sure (dakika)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                <textarea
                  value={form.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  rows={2}
                />
              </div>
              <button type="submit" className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                Randevu Olustur
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
          {["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"].map((d) => (
            <div key={d} className="bg-gray-50 p-2 text-center text-xs font-medium text-gray-500">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            const dayAppts = day ? getApptsForDay(day) : [];
            const isToday = day && new Date().getFullYear() === year && new Date().getMonth() === month && new Date().getDate() === day;
            return (
              <div key={i} className={`bg-white min-h-[100px] p-2 ${!day ? "bg-gray-50" : ""}`}>
                {day && (
                  <>
                    <span className={`text-sm ${isToday ? "bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center" : "text-gray-700"}`}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {dayAppts.map((appt) => (
                        <div
                          key={appt.id}
                          className={`text-xs p-1 rounded cursor-pointer ${
                            appt.status === "cancelled" ? "bg-red-50 text-red-700" :
                            appt.status === "completed" ? "bg-gray-100 text-gray-600" :
                            "bg-green-50 text-green-700"
                          }`}
                          title={`${appt.title} - ${getClientName(appt.client_id)}`}
                        >
                          <div className="font-medium truncate">{appt.title}</div>
                          <div>{new Date(appt.date_time).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming appointments list */}
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Randevular</h2>
        <div className="space-y-3">
          {appts
            .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
            .map((appt) => (
            <div key={appt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-sm">{appt.title}</p>
                <p className="text-xs text-gray-500">
                  {getClientName(appt.client_id)} - {new Date(appt.date_time).toLocaleString("tr-TR")} ({appt.duration_minutes} dk)
                </p>
              </div>
              <div className="flex items-center gap-2">
                {appt.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(appt.id, "completed")}
                      className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      Tamamla
                    </button>
                    <button
                      onClick={() => handleStatusChange(appt.id, "cancelled")}
                      className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Iptal
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(appt.id)} className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
