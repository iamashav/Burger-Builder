import { useState, type FormEvent } from 'react';
import { MILK_OPTIONS, TEA_OPTIONS } from '../../data/menu';
import { checkValidity } from '../../lib/validation';
import { useSaveFavouriteMutation } from '../../store/dbApi';
import type { Drink } from '../../types/drink';
import { MAX_FAVOURITE_NAME } from '../../types/favourite';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Modal } from '../Modal/Modal';

export interface SaveFavouriteDialogProps {
  open: boolean;
  drink: Drink;
  userId: string;
  onClose: () => void;
  onSaved: (name: string) => void;
}

function suggestName(drink: Drink) {
  const tea = TEA_OPTIONS[drink.tea].label;
  return drink.milk === 'none' ? tea : `${tea} with ${MILK_OPTIONS[drink.milk].label.toLowerCase()}`;
}

const NAME_RULES = { required: true, maxLength: MAX_FAVOURITE_NAME };

export function SaveFavouriteDialog({
  open,
  drink,
  userId,
  onClose,
  onSaved,
}: SaveFavouriteDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Save to favourites">
      {/* Mounted only while open so the suggested name follows the drink being saved. */}
      {open && (
        <SaveFavouriteForm drink={drink} userId={userId} onClose={onClose} onSaved={onSaved} />
      )}
    </Modal>
  );
}

function SaveFavouriteForm({
  drink,
  userId,
  onClose,
  onSaved,
}: Omit<SaveFavouriteDialogProps, 'open'>) {
  const [name, setName] = useState(() => suggestName(drink));
  const [touched, setTouched] = useState(false);
  const [saveFavourite, { isLoading, isError }] = useSaveFavouriteMutation();
  const valid = checkValidity(name, NAME_RULES);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!valid) return;

    const result = await saveFavourite({ userId, name: name.trim(), drink });
    if ('data' in result) onSaved(name.trim());
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="mb-4 font-display text-2xl tracking-wide">Save to favourites</h2>

      {isError && (
        <p role="alert" className="mb-4 border border-danger/40 px-3 py-2 text-sm text-danger">
          That did not save. Check your connection and try again.
        </p>
      )}

      <Input
        label="Name"
        value={name}
        onChange={setName}
        invalid={!valid}
        touched={touched}
        errorMessage={`Give it a name of up to ${MAX_FAVOURITE_NAME} characters.`}
      />

      <div className="mt-6 flex gap-3">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? 'Saving' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
