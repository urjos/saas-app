import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const addBookmark = vi.fn();
const removeBookmark = vi.fn();

vi.mock("@/lib/actions/companion.actions", () => ({
  addBookmark: (...args: unknown[]) => addBookmark(...args),
  removeBookmark: (...args: unknown[]) => removeBookmark(...args),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/companions" }));

import CompanionCard from "./CompanionCard";

const props = {
  id: "abc",
  name: "Neura the Brainy Explorer",
  topic: "Neural Network of the Brain",
  subject: "science",
  duration: 45,
  color: "#E5D0FF",
};

describe("CompanionCard", () => {
  beforeEach(() => vi.clearAllMocks());

  it("muestra nombre, tema, materia y duración", () => {
    render(<CompanionCard {...props} bookmarked={false} />);
    expect(
      screen.getByRole("heading", { name: props.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(props.topic)).toBeInTheDocument();
    expect(screen.getByText("science")).toBeInTheDocument();
    expect(screen.getByText("45 minutes")).toBeInTheDocument();
  });

  it("enlaza a la página de la lección", () => {
    render(<CompanionCard {...props} bookmarked={false} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/companions/abc");
  });

  it("al hacer clic en el marcador sin guardar, llama a addBookmark", async () => {
    render(<CompanionCard {...props} bookmarked={false} />);
    await userEvent.click(screen.getByAltText("bookmark"));
    expect(addBookmark).toHaveBeenCalledWith("abc", "/companions");
    expect(removeBookmark).not.toHaveBeenCalled();
  });

  it("al hacer clic en el marcador ya guardado, llama a removeBookmark", async () => {
    render(<CompanionCard {...props} bookmarked />);
    await userEvent.click(screen.getByAltText("bookmark"));
    expect(removeBookmark).toHaveBeenCalledWith("abc", "/companions");
    expect(addBookmark).not.toHaveBeenCalled();
  });
});
