import { createAction, createReducer } from '@reduxjs/toolkit';
import { describe, expect, it } from 'vitest';
import { undoable } from '../store/history';

const set = createAction<number>('counter/set');
const nudged = createAction<number>('counter/nudged');

const counter = createReducer(0, (builder) => {
  builder.addCase(set, (_state, action) => action.payload);
  builder.addCase(nudged, (_state, action) => action.payload);
});

function setup(options?: Parameters<typeof undoable>[2]) {
  const history = undoable('counter', counter, options);
  const run = (...actions: Parameters<typeof history.reducer>[1][]) =>
    actions.reduce(history.reducer, history.reducer(undefined, { type: '@@test/init' }));
  return { ...history, run };
}

describe('undoable', () => {
  it('starts with the wrapped reducer state and no history', () => {
    const { run } = setup();
    expect(run()).toEqual({ past: [], present: 0, future: [], group: null });
  });

  it('undoes and redoes in order', () => {
    const { run, undo, redo } = setup();

    expect(run(set(1), set(2), undo()).present).toBe(1);
    expect(run(set(1), set(2), undo(), undo()).present).toBe(0);
    expect(run(set(1), set(2), undo(), undo(), redo()).present).toBe(1);
  });

  it('ignores undo and redo when there is nothing to step to', () => {
    const { run, undo, redo } = setup();
    const state = run(set(1));

    expect(run(set(1), redo())).toEqual(state);
    expect(run(undo(), undo()).present).toBe(0);
  });

  it('drops the redo branch when a new change is made after undoing', () => {
    const { run, undo } = setup();
    const state = run(set(1), set(2), undo(), set(5));

    expect(state.present).toBe(5);
    expect(state.future).toEqual([]);
    expect(state.past).toEqual([0, 1]);
  });

  it('does not record actions that leave the state unchanged', () => {
    const { run } = setup();
    expect(run(set(1), set(1), { type: 'unrelated' }).past).toEqual([0]);
  });

  it('caps the number of stored steps', () => {
    const { run } = setup({ limit: 3 });
    expect(run(set(1), set(2), set(3), set(4), set(5)).past).toEqual([2, 3, 4]);
  });

  it('collapses consecutive actions in the same group into one step', () => {
    const { run, undo } = setup({
      groupBy: (action) => (nudged.match(action) ? 'nudge' : null),
    });

    const state = run(set(1), nudged(2), nudged(3), nudged(4));
    expect(state.past).toEqual([0, 1]);
    expect(run(set(1), nudged(2), nudged(3), nudged(4), undo()).present).toBe(1);
  });

  it('starts a new group after an ungrouped action or an undo', () => {
    const { run, undo } = setup({
      groupBy: (action) => (nudged.match(action) ? 'nudge' : null),
    });

    expect(run(nudged(1), set(5), nudged(2)).past).toEqual([0, 1, 5]);
    expect(run(nudged(1), nudged(2), undo(), nudged(3)).past).toEqual([0]);
  });

  it('can forget history while keeping the present', () => {
    const { run, historyCleared } = setup();
    expect(run(set(1), set(2), historyCleared())).toEqual({
      past: [],
      present: 2,
      future: [],
      group: null,
    });
  });
});
