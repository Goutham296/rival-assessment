import axios from 'axios';
import Cookies from 'js-cookie';
import type { AuthResponse, Blog, Comment, PaginatedResponse, User } from '@/types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from cookie on every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = Cookies.get('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await api.post<{ accessToken: string }>(
            '/auth/refresh',
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );
          Cookies.set('accessToken', data.accessToken, { expires: 7 });
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  },
);

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { email: string; password: string; name?: string }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
};

// ─── Blogs (private dashboard) ────────────────────────────────────────────────

export const blogsApi = {
  create: (data: { title: string; content: string; isPublished?: boolean }) =>
    api.post<Blog>('/blogs', data).then((r) => r.data),

  list: () => api.get<Blog[]>('/blogs').then((r) => r.data),

  get: (id: string) => api.get<Blog>(`/blogs/${id}`).then((r) => r.data),

  update: (id: string, data: Partial<Blog>) =>
    api.patch<Blog>(`/blogs/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/blogs/${id}`).then((r) => r.data),
};

// ─── Public ───────────────────────────────────────────────────────────────────

export const publicApi = {
  getFeed: (page = 1, limit = 10) =>
    api
      .get<PaginatedResponse<Blog>>('/public/feed', { params: { page, limit } })
      .then((r) => r.data),

  getBlogBySlug: (slug: string) =>
    api.get<Blog>(`/public/blogs/${slug}`).then((r) => r.data),
};

// ─── Likes ────────────────────────────────────────────────────────────────────

export const likesApi = {
  like: (blogId: string) =>
    api
      .post<{ liked: boolean; likeCount: number }>(`/blogs/${blogId}/like`)
      .then((r) => r.data),

  unlike: (blogId: string) =>
    api
      .delete<{ liked: boolean; likeCount: number }>(`/blogs/${blogId}/like`)
      .then((r) => r.data),
};

// ─── Comments ─────────────────────────────────────────────────────────────────

export const commentsApi = {
  create: (blogId: string, content: string) =>
    api
      .post<Comment>(`/blogs/${blogId}/comments`, { content })
      .then((r) => r.data),

  list: (blogId: string, page = 1) =>
    api
      .get<PaginatedResponse<Comment>>(`/blogs/${blogId}/comments`, {
        params: { page },
      })
      .then((r) => r.data),
};

export default api;
