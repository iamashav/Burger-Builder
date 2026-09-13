import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { parseDrink } from '../lib/drink';
import type { Order, OrderLine, OrderPayload } from '../types/order';
import type { RootState } from './index';

/** Records that predate the current order shape, or were hand-edited, are skipped. */
function parseOrder(id: string, raw: unknown): Order | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Partial<Record<keyof Order, unknown>>;
  if (!Array.isArray(record.lines) || !record.fulfilment || !record.contact) return null;

  const lines = record.lines.flatMap((line): OrderLine[] => {
    const drink = parseDrink(line?.drink);
    return drink ? [{ drink, quantity: Number(line.quantity), unitPrice: Number(line.unitPrice) }] : [];
  });
  if (lines.length === 0) return null;

  return {
    id,
    lines,
    total: Number(record.total),
    fulfilment: record.fulfilment as Order['fulfilment'],
    contact: record.contact as Order['contact'],
    userId: String(record.userId),
    createdAt: Number(record.createdAt) || 0,
  };
}

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
      transformResponse: (response: Record<string, unknown> | null) =>
        Object.entries(response ?? {})
          .flatMap(([id, raw]) => {
            const order = parseOrder(id, raw);
            return order ? [order] : [];
          })
          .sort((a, b) => b.createdAt - a.createdAt),
      providesTags: ['Orders'],
    }),

    placeOrder: builder.mutation<{ name: string }, OrderPayload>({
      query: (order) => ({ url: 'orders.json', method: 'POST', body: order }),
      invalidatesTags: ['Orders'],
    }),
  }),
});

export const { useGetOrdersQuery, usePlaceOrderMutation } = dbApi;
