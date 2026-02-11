"use client";

import { useEffect, useState } from "react";
import { users, weightLogs, Client, WeightLog } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function WeightTrackingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    users.clients().then(setClients).catch(console.error).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedClient) {
      weightLogs.getClientLogs(selectedClient).then(setLogs).catch(console.error);
    }
  }, [selectedClient]);

  const chartData = logs
    .slice()
    .reverse()
    .map((log) => ({
      date: new Date(log.logged_at).toLocaleDateString("tr-TR"),
      weight: log.weight,
      note: log.note,
    }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kilo Takibi</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Danisan Secin</label>
        <select
          value={selectedClient || ""}
          onChange={(e) => setSelectedClient(e.target.value || null)}
          className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all w-64"
        >
          <option value="">Danisan secin</option>
          {clients.filter((c) => c.status === "active").map((c) => (
            <option key={c.id} value={c.id}>{c.full_name}</option>
          ))}
        </select>
      </div>

      {selectedClient && (
        <>
          {chartData.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Kilo Grafigi</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis domain={["auto", "auto"]} fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6 text-center text-gray-500">
              Bu danisan icin kilo kaydi bulunmuyor
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Kilo Gecmisi</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Tarih</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Kilo (kg)</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Degisim</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-500">Not</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => {
                  const prevLog = logs[index + 1];
                  const change = prevLog ? log.weight - prevLog.weight : 0;
                  return (
                    <tr key={log.id} className="border-b border-gray-50">
                      <td className="p-4 text-sm">{new Date(log.logged_at).toLocaleDateString("tr-TR")}</td>
                      <td className="p-4 text-sm font-medium">{log.weight} kg</td>
                      <td className="p-4 text-sm">
                        {change !== 0 && (
                          <span className={change < 0 ? "text-green-600" : "text-red-600"}>
                            {change > 0 ? "+" : ""}{change.toFixed(1)} kg
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{log.note || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
