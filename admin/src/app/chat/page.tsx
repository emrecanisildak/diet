"use client";

import { useEffect, useState, useRef } from "react";
import { messages, users, Conversation, Message as MessageType, Client } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Send, ImageIcon, X, Loader2 } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function ChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [convs, cls] = await Promise.all([
          messages.conversations(),
          users.clients(),
        ]);
        setConversations(convs);
        setClients(cls);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const wsUrl = `${(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api").replace("http", "ws")}/messages/ws/${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const msg: MessageType = JSON.parse(event.data);
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      messages.getMessages(selectedUser).then(setChatMessages).catch(console.error);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !selectedUser) return;

    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (selectedImage) {
        const uploadRes = await messages.uploadImage(selectedImage);
        imageUrl = uploadRes.image_url;
      }

      const msg = await messages.send({
        receiver_id: selectedUser,
        content: newMessage.trim() || undefined,
        image_url: imageUrl,
      });
      setChatMessages((prev) => [...prev, msg]);
      setNewMessage("");
      removeSelectedImage();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getContactName = (userId: string) => {
    const conv = conversations.find((c) => c.user_id === userId);
    if (conv) return conv.full_name;
    const client = clients.find((c) => c.id === userId);
    return client?.full_name || "Bilinmeyen";
  };

  // Merge conversations with clients who haven't been chatted with yet
  const allContacts = [
    ...conversations,
    ...clients
      .filter((c) => c.status === "active" && !conversations.some((conv) => conv.user_id === c.id))
      .map((c) => ({
        user_id: c.id,
        full_name: c.full_name,
        last_message: "",
        last_message_at: "",
        unread_count: 0,
      })),
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mesajlar</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex" style={{ height: "calc(100vh - 200px)" }}>
        {/* Contact list */}
        <div className="w-80 border-r border-gray-100 overflow-y-auto">
          {allContacts.map((contact) => (
            <button
              key={contact.user_id}
              onClick={() => setSelectedUser(contact.user_id)}
              className={`w-full p-4 text-left hover:bg-gray-50 border-b border-gray-50 transition-colors ${
                selectedUser === contact.user_id ? "bg-green-50" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{contact.full_name}</p>
                {contact.unread_count > 0 && (
                  <span className="bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {contact.unread_count}
                  </span>
                )}
              </div>
              {contact.last_message && (
                <p className="text-xs text-gray-500 mt-1 truncate">{contact.last_message}</p>
              )}
            </button>
          ))}
          {allContacts.length === 0 && (
            <p className="p-4 text-sm text-gray-500">Henuz konusma yok</p>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold">{getContactName(selectedUser)}</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs rounded-2xl text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {msg.image_url && (
                        <img
                          src={`${BACKEND_URL}${msg.image_url}`}
                          alt="Gönderilen fotoğraf"
                          className="rounded-t-2xl max-w-full h-auto max-h-64 object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="px-4 py-2">
                        {msg.content && <p>{msg.content}</p>}
                        <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? "text-green-200" : "text-gray-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="px-4 pt-2 border-t border-gray-100">
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
                    <button
                      onClick={removeSelectedImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-3 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-green-600 transition-colors"
                  disabled={uploading}
                >
                  <ImageIcon size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajinizi yazin..."
                  className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                  disabled={uploading}
                />
                <button
                  type="submit"
                  className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={uploading && !selectedImage && !newMessage.trim()}
                >
                  {uploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Bir konusma secin
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
