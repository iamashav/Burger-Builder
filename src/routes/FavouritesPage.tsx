import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { DrinkCup } from '../components/DrinkCup/DrinkCup';
import { ErrorState } from '../components/ErrorState/ErrorState';
import { ShareButton } from '../components/ShareButton/ShareButton';
import { Spinner } from '../components/Spinner/Spinner';
import { TOPPING_OPTIONS } from '../data/menu';
import { describeDrink, priceOf } from '../lib/drink';
import { formatPrice } from '../lib/format';
import { shareUrl } from '../lib/shareCode';
import { selectUserId } from '../store/authSlice';
import { drinkAddedToCart } from '../store/cartSlice';
import { useDeleteFavouriteMutation, useGetFavouritesQuery } from '../store/dbApi';
import { drinkLoaded } from '../store/drinkSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export function FavouritesPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userId = useAppSelector(selectUserId);
  const {
    data: favourites,
    isLoading,
    isError,
    refetch,
  } = useGetFavouritesQuery(userId ?? '', { skip: !userId });
  const [deleteFavourite, { isLoading: isDeleting, isError: deleteFailed }] =
    useDeleteFavouriteMutation();

  return (
    <section>
      <h1 className="mb-6 font-display text-3xl tracking-wide">Favourites</h1>

      {isLoading && <Spinner label="Loading favourites" />}

      {isError && <ErrorState title="Favourites unavailable" onRetry={() => void refetch()} />}

      {deleteFailed && (
        <p role="alert" className="mb-4 border border-danger/40 px-3 py-2 text-sm text-danger">
          That favourite could not be removed. Please try again.
        </p>
      )}

      {favourites && favourites.length === 0 && (
        <p className="bg-ash p-6 text-center text-smoke ring-1 ring-smoke/15">
          Nothing saved yet. Build a drink you like and choose “Save to favourites”.
        </p>
      )}

      {favourites && favourites.length > 0 && (
        <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
          {favourites.map((favourite) => (
            <li
              key={favourite.id}
              aria-label={favourite.name}
              className="flex gap-4 bg-ash p-5 ring-1 ring-smoke/15"
            >
              <DrinkCup drink={favourite.drink} className="h-28 w-auto shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="truncate font-display text-lg tracking-wide">{favourite.name}</h2>
                  <span className="font-display text-flood tabular-nums">
                    {formatPrice(priceOf(favourite.drink))}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[0.6875rem] text-smoke">
                  {[
                    ...describeDrink(favourite.drink),
                    ...favourite.drink.layers.map((topping) => TOPPING_OPTIONS[topping].label),
                  ].join(' · ')}
                </p>

                <div className="mt-4 flex flex-wrap items-start gap-2">
                  <Button
                    className="px-3 py-2"
                    onClick={() => dispatch(drinkAddedToCart(favourite.drink))}
                  >
                    Add to order
                  </Button>
                  <Button
                    variant="ghost"
                    className="px-3 py-2"
                    onClick={() => {
                      dispatch(drinkLoaded(favourite.drink));
                      navigate('/');
                    }}
                  >
                    Edit
                  </Button>
                  <ShareButton url={shareUrl(favourite.drink)} label="Share" className="px-3 py-2" />
                  <Button
                    variant="danger"
                    className="px-3 py-2"
                    disabled={isDeleting || !userId}
                    onClick={() => userId && void deleteFavourite({ userId, id: favourite.id })}
                    aria-label={`Delete ${favourite.name}`}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
