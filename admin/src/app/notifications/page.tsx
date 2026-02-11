"use client";

import { useEffect, useState } from "react";
import { notifications, ScheduledNotification } from "@/lib/api";
import { Bell, Send, Calendar, Clock, Trash2, CheckCircle2, Repeat } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function NotificationsPage() {
    const [scheduled, setScheduled] = useState<ScheduledNotification[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    // Bulk Notification Form
    const [bulkTitle, setBulkTitle] = useState("");
    const [bulkContent, setBulkContent] = useState("");

    // Schedule Form
    const [schTitle, setSchTitle] = useState("");
    const [schContent, setSchContent] = useState("");
    const [schType, setSchType] = useState<"once" | "daily">("once");
    const [schDate, setSchDate] = useState("");
    const [schTime, setSchTime] = useState("");

    useEffect(() => {
        loadScheduled();
    }, []);

    async function loadScheduled() {
        try {
            const data = await notifications.getScheduled();
            setScheduled(data);
        } catch (err) {
            console.error("Failed to load scheduled notifications", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSendBulk(e: React.FormEvent) {
        e.preventDefault();
        if (!bulkTitle || !bulkContent) return;

        setSending(true);
        try {
            await notifications.sendBulk(bulkTitle, bulkContent);
            alert("Toplu bildirim basariyla gonderildi!");
            setBulkTitle("");
            setBulkContent("");
        } catch (err) {
            console.error(err);
            alert("Bildirim gonderilemedi.");
        } finally {
            setSending(false);
        }
    }

    async function handleSchedule(e: React.FormEvent) {
        e.preventDefault();
        if (!schTitle || !schContent || !schTime) return;
        if (schType === "once" && !schDate) return;

        setSending(true);
        try {
            const scheduledTime = schType === "once"
                ? `${schDate}T${schTime}:00`
                : schTime;

            await notifications.schedule({
                title: schTitle,
                content: schContent,
                schedule_type: schType,
                scheduled_time: scheduledTime,
            });
            alert("Bildirim planlandi!");
            setSchTitle("");
            setSchContent("");
            setSchDate("");
            setSchTime("");
            setSchType("once");
            loadScheduled();
        } catch (err) {
            console.error(err);
            alert("Planlama basarisiz.");
        } finally {
            setSending(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu planlanmis bildirimi silmek istediginize emin misiniz?")) return;
        try {
            await notifications.cancelScheduled(id);
            loadScheduled();
        } catch (err) {
            console.error(err);
        }
    }

    function formatScheduledTime(item: ScheduledNotification) {
        if (item.schedule_type === "daily") {
            return `Her gun ${item.scheduled_time}`;
        }
        return new Date(item.scheduled_time).toLocaleString("tr-TR");
    }

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                    <Bell size={24} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bildirim Yonetimi</h1>
                    <p className="text-gray-500">Danisanlariniza anlik veya planli bildirimler gonderin.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Forms */}
                <div className="space-y-8">
                    {/* Bulk Notification Form */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Send size={20} className="text-blue-500" />
                            Anlik Toplu Bildirim
                        </h2>
                        <form onSubmit={handleSendBulk} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bildirim Basligi</label>
                                <input
                                    type="text"
                                    value={bulkTitle}
                                    onChange={(e) => setBulkTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Orn: Yeni Makale Yayimlandi!"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icerik</label>
                                <textarea
                                    value={bulkContent}
                                    onChange={(e) => setBulkContent(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Bildirim icerigini buraya yazin..."
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={sending}>
                                {sending ? "Gonderiliyor..." : "Tum Danisanlara Gonder"}
                            </Button>
                        </form>
                    </Card>

                    {/* Schedule Notification Form */}
                    <Card className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Calendar size={20} className="text-purple-500" />
                            Bildirim Planla
                        </h2>
                        <form onSubmit={handleSchedule} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bildirim Basligi</label>
                                <input
                                    type="text"
                                    value={schTitle}
                                    onChange={(e) => setSchTitle(e.target.value)}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Orn: Hatirlatma!"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icerik</label>
                                <textarea
                                    value={schContent}
                                    onChange={(e) => setSchContent(e.target.value)}
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Planlanan bildirim icerigi..."
                                    required
                                />
                            </div>
                            {/* Schedule Type Selector */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bildirim Tipi</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSchType("once")}
                                        className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                            schType === "once"
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Calendar size={16} />
                                        Tek Seferlik
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSchType("daily")}
                                        className={`px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                                            schType === "daily"
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                        }`}
                                    >
                                        <Repeat size={16} />
                                        Her Gun Tekrarla
                                    </button>
                                </div>
                            </div>
                            {/* Conditional Date/Time Fields */}
                            {schType === "once" ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tarih</label>
                                        <input
                                            type="date"
                                            value={schDate}
                                            onChange={(e) => setSchDate(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Saat</label>
                                        <input
                                            type="time"
                                            value={schTime}
                                            onChange={(e) => setSchTime(e.target.value)}
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Her Gun Gonderilecek Saat</label>
                                    <input
                                        type="time"
                                        value={schTime}
                                        onChange={(e) => setSchTime(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                        required
                                    />
                                </div>
                            )}
                            <Button type="submit" variant="secondary" className="w-full" disabled={sending}>
                                {sending ? "Planlaniyor..." : "Bildirimi Planla"}
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Column: Scheduled List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-orange-500" />
                        Planlanan Bildirimler
                    </h2>

                    {loading ? (
                        <p className="text-gray-500 italic">Yukleniyor...</p>
                    ) : scheduled.length === 0 ? (
                        <Card className="p-8 border-dashed border-2 flex flex-col items-center justify-center text-gray-400">
                            <Calendar size={48} className="mb-2 opacity-20" />
                            <p>Henuz planlanmis bildirim yok.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {scheduled.map((item) => (
                                <Card key={item.id} className="p-4 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900">{item.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{item.content}</p>
                                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                                <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-lg flex items-center gap-1">
                                                    <Clock size={12} />
                                                    {formatScheduledTime(item)}
                                                </span>
                                                {item.schedule_type === "daily" ? (
                                                    <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-600 rounded-lg flex items-center gap-1">
                                                        <Repeat size={12} />
                                                        Gunluk
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-600 rounded-lg">
                                                        Tek Seferlik
                                                    </span>
                                                )}
                                                {item.is_active ? (
                                                    <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-600 rounded-lg flex items-center gap-1">
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-600 rounded-lg flex items-center gap-1">
                                                        <CheckCircle2 size={12} />
                                                        Gonderildi
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
