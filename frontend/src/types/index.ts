export interface User {
  id: string;
  email: string;
  name?: string | null;
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  _count?: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}
