import { createAction, type Reducer, type UnknownAction } from '@reduxjs/toolkit';

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
  /** Coalescing key of the action that produced `present`, if it had one. */
  group: string | null;
}

export interface UndoableOptions {
  limit?: number;
  /**
   * Consecutive actions with the same non-null key collapse into one history entry, so
   * dragging a slider through twenty values undoes in one step rather than twenty.
   */
  groupBy?: (action: UnknownAction) => string | null;
}

export function undoable<T>(
  name: string,
  reducer: Reducer<T>,
  { limit = 50, groupBy }: UndoableOptions = {},
) {
  const undo = createAction(`${name}/undo`);
  const redo = createAction(`${name}/redo`);
  const historyCleared = createAction(`${name}/historyCleared`);

  const initialState: History<T> = {
    past: [],
    present: reducer(undefined, { type: `${name}/@@init` }),
    future: [],
    group: null,
  };

  const historyReducer = (
    state: History<T> = initialState,
    action: UnknownAction,
  ): History<T> => {
    const { past, present, future } = state;

    if (undo.match(action)) {
      if (past.length === 0) return state;
      return {
        past: past.slice(0, -1),
        present: past[past.length - 1],
        future: [present, ...future],
        group: null,
      };
    }

    if (redo.match(action)) {
      if (future.length === 0) return state;
      return {
        past: [...past, present],
        present: future[0],
        future: future.slice(1),
        group: null,
      };
    }

    if (historyCleared.match(action)) {
      return { past: [], present, future: [], group: null };
    }

    const next = reducer(present, action);
    // Immer hands back the same reference for a no-op, which must not cost an undo step.
    if (next === present) return state;

    const group = groupBy?.(action) ?? null;
    if (group !== null && group === state.group) {
      return { past, present: next, future: [], group };
    }

    return { past: [...past, present].slice(-limit), present: next, future: [], group };
  };

  return { reducer: historyReducer, undo, redo, historyCleared };
}
