import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { Order, OrderPayload } from '../types/order';
import type { RootState } from './index';

const rawBaseQuery = fetchBaseQuery({ baseUrl: import.meta.env.VITE_FIREBASE_DB_URL });

/**
 * The Realtime Database REST API authenticates with an `?auth=` query parameter rather
 * than an Authorization header, so the token is spliced into params here instead of in
 * `prepareHeaders`. Doing it once at the base query keeps every endpoint token-free.
 */
const baseQueryWithAuth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = (
  args,
  api,
  extraOptions,
) => {
  const { token } = (api.getState() as RootState).auth;
  if (!token) return rawBaseQuery(args, api, extraOptions);

  const withAuth: FetchArgs =
    typeof args === 'string'
      ? { url: args, params: { auth: token } }
      : { ...args, params: { ...args.params, auth: token } };

  return rawBaseQuery(withAuth, api, extraOptions);
};

export const dbApi = createApi({
  reducerPath: 'dbApi',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Orders'],
  endpoints: (builder) => ({
    getOrders: builder.query<Order[], string>({
      query: (userId) => ({
        url: 'orders.json',
        params: { orderBy: '"userId"', equalTo: `"${userId}"` },
      }),
      transformResponse: (response: Record<string, OrderPayload> | null) =>
        Object.entries(response ?? {}).map(([id, order]) => ({ ...order, id })),
      providesTags: ['Orders'],
    }),

    placeOrder: builder.mutation<{ name: string }, OrderPayload>({
      query: (order) => ({ url: 'orders.json', method: 'POST', body: order }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { useGetOrdersQuery, usePlaceOrderMutation } = dbApi;
