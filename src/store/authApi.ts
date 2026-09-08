import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface SignInRequest {
  email: string;
  password: string;
}

export interface IdentityToolkitResponse {
  idToken: string;
  localId: string;
  expiresIn: string;
  email: string;
}

interface IdentityToolkitError {
  error?: { message?: string };
}

const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://identitytoolkit.googleapis.com/v1/' }),
  endpoints: (builder) => ({
    signUp: builder.mutation<IdentityToolkitResponse, SignInRequest>({
      query: (credentials) => ({
        url: `accounts:signUp?key=${API_KEY}`,
        method: 'POST',
        body: { ...credentials, returnSecureToken: true },
      }),
    }),
    signIn: builder.mutation<IdentityToolkitResponse, SignInRequest>({
      query: (credentials) => ({
        url: `accounts:signInWithPassword?key=${API_KEY}`,
        method: 'POST',
        body: { ...credentials, returnSecureToken: true },
      }),
    }),
  }),
});

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  EMAIL_EXISTS: 'That email address is already registered. Try signing in instead.',
  EMAIL_NOT_FOUND: 'No account exists for that email address.',
  INVALID_PASSWORD: 'That password is incorrect.',
  INVALID_LOGIN_CREDENTIALS: 'That email address and password do not match.',
  USER_DISABLED: 'That account has been disabled.',
  WEAK_PASSWORD: 'Passwords must be at least 6 characters long.',
  TOO_MANY_ATTEMPTS_TRY_LATER: 'Too many attempts. Please wait a moment and try again.',
};

/** Identity Toolkit returns machine codes like `EMAIL_EXISTS`; never show those raw. */
export function formatAuthError(error: FetchBaseQueryError | undefined): string | null {
  if (!error) return null;

  const code =
    'data' in error ? (error.data as IdentityToolkitError | undefined)?.error?.message : undefined;
  if (!code) return 'Something went wrong. Please try again.';

  return AUTH_ERROR_MESSAGES[code.split(' : ')[0]] ?? 'Something went wrong. Please try again.';
}

export const { useSignUpMutation, useSignInMutation } = authApi;
