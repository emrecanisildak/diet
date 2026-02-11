const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          headers["Authorization"] = `Bearer ${data.access_token}`;
          const retryRes = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
          });
          if (!retryRes.ok) throw new Error("Request failed after refresh");
          return retryRes.json();
        }
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  if (res.status === 204) return {} as T;
  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

// Auth
export const auth = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; refresh_token: string }>("/auth/login", {
      email,
      password,
    }),
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    phone?: string;
  }) => api.post("/auth/register", data),
};

// Users
export const users = {
  me: () => api.get<User>("/users/me"),
  clients: () => api.get<Client[]>("/users/clients"),
  addClient: (clientId: string) => api.post(`/users/clients/${clientId}`),
  removeClient: (clientId: string) => api.delete(`/users/clients/${clientId}`),
  getClient: (clientId: string) => api.get<Client>(`/users/clients/${clientId}`),
  getClientDietPlans: (clientId: string) =>
    api.get<DietPlan[]>(`/users/clients/${clientId}/diet-plans`),
  getClientAppointments: (clientId: string) =>
    api.get<Appointment[]>(`/users/clients/${clientId}/appointments`),
};

// Diet Plans
export const dietPlans = {
  list: () => api.get<DietPlan[]>("/diet-plans"),
  get: (id: string) => api.get<DietPlan>(`/diet-plans/${id}`),
  create: (data: DietPlanCreate) => api.post<DietPlan>("/diet-plans", data),
  update: (id: string, data: Partial<DietPlanCreate>) =>
    api.put<DietPlan>(`/diet-plans/${id}`, data),
  delete: (id: string) => api.delete(`/diet-plans/${id}`),
  addMeal: (planId: string, data: MealCreate) =>
    api.post<Meal>(`/diet-plans/${planId}/meals`, data),
  updateMeal: (planId: string, mealId: string, data: Partial<MealCreate>) =>
    api.put<Meal>(`/diet-plans/${planId}/meals/${mealId}`, data),
  deleteMeal: (planId: string, mealId: string) =>
    api.delete(`/diet-plans/${planId}/meals/${mealId}`),
  addMealItem: (planId: string, mealId: string, data: MealItemCreate) =>
    api.post<MealItem>(`/diet-plans/${planId}/meals/${mealId}/items`, data),
  updateMealItem: (
    planId: string,
    mealId: string,
    itemId: string,
    data: Partial<MealItemCreate>
  ) =>
    api.put<MealItem>(
      `/diet-plans/${planId}/meals/${mealId}/items/${itemId}`,
      data
    ),
  deleteMealItem: (planId: string, mealId: string, itemId: string) =>
    api.delete(`/diet-plans/${planId}/meals/${mealId}/items/${itemId}`),
};

// Weight Logs
export const weightLogs = {
  getClientLogs: (clientId: string) =>
    api.get<WeightLog[]>(`/weight-logs/client/${clientId}`),
};

// Messages
export const messages = {
  conversations: () => api.get<Conversation[]>("/messages/conversations"),
  getMessages: (userId: string) => api.get<Message[]>(`/messages/${userId}`),
  send: (data: { receiver_id: string; content?: string; image_url?: string }) =>
    api.post<Message>("/messages", data),
  uploadImage: async (file: File): Promise<{ image_url: string }> => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/messages/upload`,
      {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
};

// Appointments
export const appointments = {
  list: () => api.get<Appointment[]>("/appointments"),
  get: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  create: (data: AppointmentCreate) =>
    api.post<Appointment>("/appointments", data),
  update: (id: string, data: AppointmentUpdate) =>
    api.put<Appointment>(`/appointments/${id}`, data),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Notifications
export const notifications = {
  sendBulk: (title: string, content: string) =>
    api.post("/notifications/send-bulk", { title, content }),
  schedule: (data: ScheduledNotificationCreate) =>
    api.post<ScheduledNotification>("/notifications/schedule", data),
  getScheduled: () => api.get<ScheduledNotification[]>("/notifications/scheduled"),
  cancelScheduled: (id: string) => api.delete(`/notifications/scheduled/${id}`),
};

// Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  phone: string | null;
  created_at: string;
}

export interface Client extends User {
  status: string;
}

export interface DietPlan {
  id: string;
  dietitian_id: string;
  client_id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  meals: Meal[];
}

export interface MealItem {
  id: string;
  meal_id: string;
  name: string;
  amount: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  sort_order: number;
}

export interface MealItemCreate {
  name: string;
  amount?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sort_order?: number;
}

export interface Meal {
  id: string;
  diet_plan_id: string;
  meal_type: string;
  day_of_week: number;
  name: string;
  description: string | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  items: MealItem[];
}

export interface MealCreate {
  meal_type: string;
  day_of_week: number;
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface DietPlanCreate {
  client_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_active?: boolean;
  meals?: MealCreate[];
}

export interface WeightLog {
  id: string;
  client_id: string;
  weight: number;
  note: string | null;
  logged_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string | null;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  user_id: string;
  full_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Appointment {
  id: string;
  dietitian_id: string;
  client_id: string;
  title: string;
  date_time: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
}

export interface AppointmentCreate {
  client_id: string;
  title: string;
  date_time: string;
  duration_minutes?: number;
  notes?: string;
}

export interface AppointmentUpdate {
  title?: string;
  date_time?: string;
  duration_minutes?: number;
  status?: string;
  notes?: string;
}

export interface ScheduledNotification {
  id: string;
  title: string;
  content: string;
  schedule_type: string;
  scheduled_time: string;
  target_type?: string;
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

export interface ScheduledNotificationCreate {
  title: string;
  content: string;
  schedule_type: string;
  scheduled_time: string;
}
