import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { parseDrink } from '../lib/drink';
import type { Drink } from '../types/drink';
import type { Favourite, FavouritePayload } from '../types/favourite';
import { SERVER_TIMESTAMP, type Order, type OrderLine, type OrderPayload } from '../types/order';
import type { RootState } from './index';

interface SaveFavouriteArgs {
  userId: string;
  name: string;
  drink: Drink;
}

function parseFavourite(id: string, raw: unknown): Favourite | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const drink = parseDrink(record.drink);
  if (!drink || typeof record.name !== 'string') return null;
  return { id, name: record.name, drink, createdAt: Number(record.createdAt) || 0 };
}

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
  tagTypes: ['Orders', 'Favourites'],
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

    getFavourites: builder.query<Favourite[], string>({
      query: (userId) => `favourites/${encodeURIComponent(userId)}.json`,
      transformResponse: (response: Record<string, unknown> | null) =>
        Object.entries(response ?? {})
          .flatMap(([id, raw]) => {
            const favourite = parseFavourite(id, raw);
            return favourite ? [favourite] : [];
          })
          .sort((a, b) => b.createdAt - a.createdAt),
      providesTags: ['Favourites'],
    }),

    saveFavourite: builder.mutation<{ name: string }, SaveFavouriteArgs>({
      query: ({ userId, name, drink }) => ({
        url: `favourites/${encodeURIComponent(userId)}.json`,
        method: 'POST',
        body: { name, drink, createdAt: SERVER_TIMESTAMP } satisfies FavouritePayload,
      }),
      invalidatesTags: ['Favourites'],
    }),

    deleteFavourite: builder.mutation<null, { userId: string; id: string }>({
      query: ({ userId, id }) => ({
        url: `favourites/${encodeURIComponent(userId)}/${encodeURIComponent(id)}.json`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favourites'],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  usePlaceOrderMutation,
  useGetFavouritesQuery,
  useSaveFavouriteMutation,
  useDeleteFavouriteMutation,
} = dbApi;
