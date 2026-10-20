import { useSyncExternalStore, useCallback, useState, useEffect } from 'react'
import { store, type AuthUser, type DB, type Registration } from './store'
import api from './api'
import { ApiError, apiRequest, getToken, normalizeDocument, normalizeUser, setToken } from './api'

type AuthPayload = { user: Record<string, unknown>; token?: string }
type RoomsPayload = { rooms: Record<string, unknown>[] }
type RegistrationsPayload = { registrations: Record<string, unknown>[] }
type InvoicesPayload = { invoices: Record<string, unknown>[] }
type ComplaintsPayload = { complaints: Record<string, unknown>[] }
type LaundryPayload = { requests: Record<string, unknown>[] }
type MenuPayload = { menu: Record<string, unknown>[] }

export function useStore(): DB {
  return useSyncExternalStore(store.subscribe, store.get, store.get)
}

function replaceState(partial: Partial<DB>) {
  store.set({ ...store.get(), ...partial })
}

async function loadPrivateData(user: AuthUser) {
  let registrations: Registration[] = []
  if (user.role === 'admin') {
    const result = await apiRequest<RegistrationsPayload>('/registrations')
    registrations = result.registrations.map(normalizeDocument) as unknown as Registration[]
  } else {
    user.residentId = undefined
    try {
      const result = await apiRequest<{ registration: Record<string, unknown> }>('/registrations/me')
      const registration = normalizeDocument(result.registration) as unknown as Registration
      registrations = [registration]
      user.residentId = registration.id
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
    }
  }

  if (user.role === 'resident' && registrations[0]?.status !== 'approved') {
    return {
      user,
      registrations,
      invoices: [],
      complaints: [],
      laundry: [],
    }
  }

  const [invoices, complaints, laundry] = await Promise.all([
    apiRequest<InvoicesPayload>('/invoices'),
    apiRequest<ComplaintsPayload>('/complaints'),
    apiRequest<LaundryPayload>('/laundry'),
  ])

  return {
    user,
    registrations,
    invoices: invoices.invoices.map(normalizeDocument) as unknown as DB['invoices'],
    complaints: complaints.complaints.map(normalizeDocument) as unknown as DB['complaints'],
    laundry: laundry.requests.map(normalizeDocument) as unknown as DB['laundry'],
  }
}

export async function initializeApp() {
  replaceState({ loading: true, error: null })
  try {
    const [rooms, menu] = await Promise.all([
      apiRequest<RoomsPayload>('/rooms'),
      apiRequest<MenuPayload>('/menu'),
    ])
    let user: AuthUser | null = null
    const token = getToken()
    if (token) {
      try {
        const result = await apiRequest<{ user: Record<string, unknown> }>('/auth/me')
        user = normalizeUser(result.user)
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) setToken(null)
        else throw error
      }
    }

    const privateData = user ? await loadPrivateData(user) : {
      user: null,
      registrations: [],
      invoices: [],
      complaints: [],
      laundry: [],
    }
    store.set({
      ...store.get(),
      ...privateData,
      rooms: rooms.rooms.map(normalizeDocument) as unknown as DB['rooms'],
      menu: menu.menu as unknown as DB['menu'],
      loading: false,
      error: null,
    })
  } catch (error) {
    replaceState({ loading: false, error: error instanceof Error ? error.message : 'Unable to load StayNest data.' })
  }
}

export async function refreshAppData() {
  const [rooms, menu] = await Promise.all([
    apiRequest<RoomsPayload>('/rooms'),
    apiRequest<MenuPayload>('/menu'),
  ])
  let currentUser: AuthUser | null = null
  if (getToken()) {
    const result = await apiRequest<{ user: Record<string, unknown> }>('/auth/me')
    currentUser = normalizeUser(result.user)
  }
  const privateData = currentUser ? await loadPrivateData(currentUser) : {
    user: null,
    registrations: [],
    invoices: [],
    complaints: [],
    laundry: [],
  }
  store.set({
    ...store.get(),
    ...privateData,
    rooms: rooms.rooms.map(normalizeDocument) as unknown as DB['rooms'],
    menu: menu.menu as unknown as DB['menu'],
    loading: false,
    error: null,
  })
}

export async function loginWithPassword(email: string, password: string, role: 'resident' | 'admin') {
  const result = await apiRequest<AuthPayload>('/auth/login', {
    method: 'POST',
    body: { email, password, role },
  })
  if (!result.token) throw new Error('The API did not return an authentication token.')
  setToken(result.token)
  await refreshAppData()
  const user = store.get().user
  if (!user) throw new Error('The account could not be loaded after sign in.')
  return user
}

export async function logout() {
  try {
    await apiRequest('/auth/logout', { method: 'POST' })
  } finally {
    setToken(null)
    replaceState({
      user: null,
      registrations: [],
      invoices: [],
      complaints: [],
      laundry: [],
      error: null,
    })
  }
}

export function reportApiError(error: unknown) {
  replaceState({
    error: error instanceof Error ? error.message : 'The request could not be completed.',
  })
}

export function clearApiError() {
  replaceState({ error: null })
}

// Authentication Hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          const response = await api.auth.me();
          if (response.success && response.data) {
            setUser(response.data);
          }
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.login({ email, password });
      if (response.success && response.data?.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
    }
  }, []);

  const register = useCallback(async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.auth.register(userData);
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };
}

// API Fetch Hook
export function useFetch<T>(
  fetchFn: () => Promise<any>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFn();
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message || 'Fetch failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
}
