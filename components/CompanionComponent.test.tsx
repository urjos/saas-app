import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Vapi falso: guarda los handlers para poder "emitir" eventos desde el test
const { fakeVapi, emit, resetFakeVapi } = vi.hoisted(() => {
  let handlers: Record<string, Array<(payload?: unknown) => void>> = {};
  let muted = false;

  const fakeVapi = {
    on: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      (handlers[event] ??= []).push(handler);
    }),
    off: vi.fn((event: string, handler: (payload?: unknown) => void) => {
      handlers[event] = (handlers[event] ?? []).filter((h) => h !== handler);
    }),
    start: vi.fn(),
    stop: vi.fn(),
    isMuted: vi.fn(() => muted),
    setMuted: vi.fn((value: boolean) => {
      muted = value;
    }),
  };

  const emit = (event: string, payload?: unknown) =>
    (handlers[event] ?? []).forEach((handler) => handler(payload));

  const resetFakeVapi = () => {
    handlers = {};
    muted = false;
  };

  return { fakeVapi, emit, resetFakeVapi };
});

const addToSessionHistory = vi.fn();

vi.mock("@/lib/vapi.sdk", () => ({ vapi: fakeVapi }));
vi.mock("@/lib/actions/companion.actions", () => ({
  addToSessionHistory: (...args: unknown[]) => addToSessionHistory(...args),
}));
// lottie-react necesita canvas, que jsdom no tiene
vi.mock("lottie-react", () => ({
  default: () => <div data-testid="lottie" />,
}));

import CompanionComponent from "./CompanionComponent";

const props = {
  companionId: "comp-1",
  subject: "coding",
  topic: "If-Else statements",
  name: "Codey the Logic Hacker",
  userName: "Josué",
  userImage: "https://example.com/avatar.png",
  voice: "male",
  style: "casual",
} as const;

const mainButton = (name: string) => screen.getByRole("button", { name });

describe("CompanionComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetFakeVapi();
  });

  it('arranca inactivo: muestra "Start Session" y el micrófono deshabilitado', () => {
    render(<CompanionComponent {...props} />);
    expect(mainButton("Start Session")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /microphone/i })).toBeDisabled();
    expect(screen.getByText(props.name)).toBeInTheDocument();
  });

  it('al iniciar, pasa a "Connecting" y arranca Vapi con las variables de la sesión', async () => {
    const user = userEvent.setup();
    render(<CompanionComponent {...props} />);

    await user.click(mainButton("Start Session"));

    expect(mainButton("Connecting")).toBeInTheDocument();
    expect(fakeVapi.start).toHaveBeenCalledTimes(1);
    const [assistant, overrides] = fakeVapi.start.mock.calls[0];
    expect(assistant.voice.voiceId).toBe("2BJW5coyhAzSr8STdHbE");
    expect(overrides.variableValues).toEqual({
      subject: "coding",
      topic: "If-Else statements",
      style: "casual",
    });
  });

  it('cuando la llamada empieza, muestra "End Session" y habilita el micrófono', async () => {
    const user = userEvent.setup();
    render(<CompanionComponent {...props} />);
    await user.click(mainButton("Start Session"));

    act(() => emit("call-start"));

    expect(mainButton("End Session")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /microphone/i })).toBeEnabled();
  });

  it('"End Session" detiene Vapi y vuelve al estado inicial', async () => {
    const user = userEvent.setup();
    render(<CompanionComponent {...props} />);
    await user.click(mainButton("Start Session"));
    act(() => emit("call-start"));

    await user.click(mainButton("End Session"));

    expect(fakeVapi.stop).toHaveBeenCalledTimes(1);
    expect(mainButton("Start Session")).toBeInTheDocument();
  });

  it("al terminar la llamada guarda la sesión en el historial", () => {
    render(<CompanionComponent {...props} />);

    act(() => emit("call-end"));

    expect(addToSessionHistory).toHaveBeenCalledWith("comp-1");
    expect(mainButton("Start Session")).toBeInTheDocument();
  });

  it("muestra solo transcripciones finales, con el más reciente primero", () => {
    render(<CompanionComponent {...props} />);

    act(() => {
      emit("message", {
        type: "transcript",
        transcriptType: "partial",
        role: "assistant",
        transcript: "Hel",
      });
      emit("message", {
        type: "transcript",
        transcriptType: "final",
        role: "assistant",
        transcript: "Hello, ready to learn?",
      });
      emit("message", {
        type: "transcript",
        transcriptType: "final",
        role: "user",
        transcript: "Yes, let us start",
      });
    });

    const lines = screen
      .getAllByText(/Hello, ready to learn\?|Yes, let us start/)
      .map((el) => el.textContent);

    expect(screen.queryByText(/Hel$/)).not.toBeInTheDocument();
    expect(lines).toEqual([
      "Josué: Yes, let us start",
      "Codey: Hello, ready to learn?",
    ]);
  });

  it("el botón del micrófono silencia y cambia su etiqueta", async () => {
    const user = userEvent.setup();
    render(<CompanionComponent {...props} />);
    await user.click(mainButton("Start Session"));
    act(() => emit("call-start"));

    await user.click(
      screen.getByRole("button", { name: /turn off microphone/i }),
    );

    expect(fakeVapi.setMuted).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole("button", { name: /turn on microphone/i }),
    ).toBeInTheDocument();
  });

  it("al desmontar, elimina todos sus listeners de Vapi", () => {
    const { unmount } = render(<CompanionComponent {...props} />);
    const registered = fakeVapi.on.mock.calls.length;

    unmount();

    expect(registered).toBe(6);
    expect(fakeVapi.off).toHaveBeenCalledTimes(registered);
  });
});
