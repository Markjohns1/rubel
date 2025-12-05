import { z } from "zod";

// Types matching FastAPI Pydantic models
export interface Product {
  id: number;
  nameBn: string;
  nameEn: string;
  price: number;
  descriptionBn: string;
  descriptionEn: string;
  image: string;
  category: 'bed' | 'sofa' | 'cupboard' | 'door' | 'dining';
}

export interface ProductCreateData {
  nameBn: string;
  nameEn: string;
  price: number;
  descriptionBn?: string;
  descriptionEn?: string;
  category: string;
  image: File;
}

export interface ProductUpdateData {
  nameBn?: string;
  nameEn?: string;
  price?: number;
  descriptionBn?: string;
  descriptionEn?: string;
  category?: string;
  image?: File;
}

export interface User {
  username: string;
  isAdmin: boolean;
  token?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  isAdmin: boolean;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  items: string;
  status: string;
  created_at?: string;
}

export interface OrderCreate {
  customer_name: string;
  customer_phone: string;
  customer_address?: string;
  total_amount: number;
  items: string;
}

export interface DashboardStats {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  total_products: number;
}

export interface UserInDB {
  id: number;
  username: string;
  is_admin: boolean;
}

// API Helper for JSON requests
const BASE_URL = "/api";

async function fetchJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${res.statusText}`);
  }

  return res.json();
}

// Helper for FormData requests (file uploads)
async function fetchFormData<T>(endpoint: string, formData: FormData, method: string = "POST"): Promise<T> {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `API Error: ${res.statusText}`);
  }

  return res.json();
}

// Product API
export const api = {
  products: {
    list: () => fetchJson<Product[]>("/products"),
    get: (id: number) => fetchJson<Product>(`/products/${id}`),
    create: (data: ProductCreateData) => {
      const formData = new FormData();
      formData.append("nameEn", data.nameEn);
      formData.append("nameBn", data.nameBn);
      formData.append("price", data.price.toString());
      formData.append("category", data.category);
      formData.append("descriptionEn", data.descriptionEn || "");
      formData.append("descriptionBn", data.descriptionBn || "");
      formData.append("image", data.image);
      return fetchFormData<Product>("/products", formData, "POST");
    },
    update: (id: number, data: ProductUpdateData) => {
      const formData = new FormData();
      if (data.nameEn) formData.append("nameEn", data.nameEn);
      if (data.nameBn) formData.append("nameBn", data.nameBn);
      if (data.price !== undefined) formData.append("price", data.price.toString());
      if (data.category) formData.append("category", data.category);
      if (data.descriptionEn !== undefined) formData.append("descriptionEn", data.descriptionEn);
      if (data.descriptionBn !== undefined) formData.append("descriptionBn", data.descriptionBn);
      if (data.image) formData.append("image", data.image);
      return fetchFormData<Product>(`/products/${id}`, formData, "PUT");
    },
    delete: (id: number) => fetchJson<{ message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),
  },
  auth: {
    login: async (credentials: { username: string; password: string }): Promise<LoginResponse> => {
      const formData = new URLSearchParams();
      formData.append("username", credentials.username);
      formData.append("password", credentials.password);

      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Login failed");
      }

      return res.json();
    },
    register: async (data: RegisterRequest): Promise<LoginResponse> => {
      return fetchJson<LoginResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    me: () => fetchJson<User>("/auth/me"),
  },
  orders: {
    list: () => fetchJson<Order[]>("/orders"),
    create: (order: OrderCreate) => fetchJson<{ message: string; order_id: number }>("/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  },
  stats: {
    get: () => fetchJson<DashboardStats>("/stats"),
  },
  users: {
    list: () => fetchJson<UserInDB[]>("/users/"),
    get: (id: number) => fetchJson<UserInDB>(`/users/${id}`),
    create: (data: { username: string; password: string; is_admin: boolean }) => 
      fetchJson<UserInDB>("/users/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: number, data: { username?: string; password?: string; is_admin?: boolean }) =>
      fetchJson<UserInDB>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) => fetchJson<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
    }),
  },
};