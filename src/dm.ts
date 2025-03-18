import { createMachine } from "xstate";

const testMachine = createMachine({
  id: "test",
  initial: "idle",
  states: {
    idle: { on: { START: "active" } },
    active: { on: { STOP: "idle" } },
  },
});

// Fix for XState v5
