
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://192.168.0.98:5000';
const AUTH_TOKEN_KEY = 'examx_auth_token';

export async function saveAuthToken(token) {
  if (typeof token !== 'string' || !token) {
    throw new Error('Invalid authentication token.');
  }

  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function getAuthToken() {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function apiRequest(endpoint, options = {}) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          'Something went wrong. Please try again.'
      );
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Connection timed out. Please check your network.'
      );
    }

    if (error instanceof TypeError) {
      throw new Error(
        'Cannot connect to the ExamX server. Check your Wi-Fi and backend.'
      );
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function authenticatedRequest(
  endpoint,
  options = {}
) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Please log in to continue.');
  }

  try {
    return await apiRequest(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    const invalidSessionMessages = [
      'Your session has expired. Please log in again.',
      'Invalid authentication token.',
      'This account is no longer available.',
      'Authentication required. Please log in.',
    ];

    if (invalidSessionMessages.includes(error.message)) {
      await clearAuthToken();
    }

    throw error;
  }
}

export async function registerStudent(
  fullName,
  email,
  password
) {
  return apiRequest('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName,
      email,
      password,
    }),
  });
}

export async function loginStudent(email, password) {
  const result = await apiRequest('/api/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!result.token || !result.user) {
    throw new Error('Invalid login response from server.');
  }

  await saveAuthToken(result.token);

  return result;
}

export async function getAuthenticatedStudent() {
  return authenticatedRequest('/api/auth/me');
}

export async function logoutStudent() {
  await clearAuthToken();
}

// Save one completed quiz attempt for the logged-in student.
export async function saveQuizAttempt(attempt) {
  return authenticatedRequest('/api/quiz-attempts', {
    method: 'POST',
    body: JSON.stringify(attempt),
  });
}

// Retrieve the logged-in student's MongoDB quiz history.
export async function getQuizAttempts() {
  return authenticatedRequest('/api/quiz-attempts', {
    method: 'GET',
  });
}
