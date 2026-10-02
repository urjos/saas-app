import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createCompanion = vi.fn();
const redirect = vi.fn();

vi.mock("@/lib/actions/companion.actions", () => ({
  createCompanion: (...args: unknown[]) => createCompanion(...args),
}));
vi.mock("next/navigation", () => ({
  redirect: (...args: unknown[]) => redirect(...args),
}));

import CompanionForm from "./CompanionForm";

// Abre un Select de shadcn/base-ui por su placeholder y elige una opción
async function pick(
  user: ReturnType<typeof userEvent.setup>,
  placeholder: string,
  option: string,
) {
  await user.click(screen.getByText(placeholder));
  await user.click(await screen.findByRole("option", { name: option }));
}

describe("CompanionForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza los campos y el botón de envío", () => {
    render(<CompanionForm />);
    expect(screen.getByLabelText("Companion name")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/what should the companion help with/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/estimated session duration/i)).toHaveValue(
      15,
    );
    expect(
      screen.getByRole("button", { name: "Build Your Companion" }),
    ).toBeInTheDocument();
  });

  it("muestra errores de Zod y no crea el companion si faltan campos", async () => {
    const user = userEvent.setup();
    render(<CompanionForm />);

    // El nombre tiene `required` nativo, así que lo llenamos para llegar a Zod
    await user.type(screen.getByLabelText("Companion name"), "Codey");
    await user.click(
      screen.getByRole("button", { name: "Build Your Companion" }),
    );

    expect(await screen.findByText("Subject is required.")).toBeInTheDocument();
    expect(screen.getByText("Topic is required.")).toBeInTheDocument();
    expect(screen.getByText("Voice is required.")).toBeInTheDocument();
    expect(screen.getByText("Style is required.")).toBeInTheDocument();
    expect(createCompanion).not.toHaveBeenCalled();
  });

  it("rechaza una duración menor a 1", async () => {
    const user = userEvent.setup();
    render(<CompanionForm />);

    await user.type(screen.getByLabelText("Companion name"), "Codey");
    const duration = screen.getByLabelText(/estimated session duration/i);
    await user.clear(duration);
    await user.type(duration, "0");
    await user.click(
      screen.getByRole("button", { name: "Build Your Companion" }),
    );

    await waitFor(() =>
      expect(screen.getByText("Duration is required.")).toBeInTheDocument(),
    );
    expect(createCompanion).not.toHaveBeenCalled();
  });

  it("con datos válidos crea el companion y redirige a su página", async () => {
    createCompanion.mockResolvedValue({ id: "new-id" });
    const user = userEvent.setup();
    render(<CompanionForm />);

    await user.type(screen.getByLabelText("Companion name"), "Codey");
    await pick(user, "Select the subject", "coding");
    await user.type(
      screen.getByLabelText(/what should the companion help with/i),
      "If-Else statements",
    );
    await pick(user, "Select the voice", "Male");
    await pick(user, "Select the style", "Casual");
    await user.click(
      screen.getByRole("button", { name: "Build Your Companion" }),
    );

    await waitFor(() =>
      expect(createCompanion).toHaveBeenCalledWith({
        name: "Codey",
        subject: "coding",
        topic: "If-Else statements",
        voice: "male",
        style: "casual",
        duration: 15,
      }),
    );
    await waitFor(() =>
      expect(redirect).toHaveBeenCalledWith("/companions/new-id"),
    );
  });
});
