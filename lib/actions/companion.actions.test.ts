import { describe, it, expect, vi, beforeEach } from "vitest";

const authMock = vi.fn();
const eqMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({ auth: () => authMock() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/supabase", () => ({
  createSupabaseClient: () => ({
    from: () => ({ select: () => ({ eq: eqMock }) }),
  }),
}));

import { newCompanionPermissions } from "./companion.actions";

const withPlan = (has: (query: any) => boolean) =>
  authMock.mockResolvedValue({ userId: "user_1", has });

const companions = (n: number) => ({
  data: Array.from({ length: n }, (_, i) => ({ id: `c${i}` })),
  error: null,
});

describe("newCompanionPermissions", () => {
  beforeEach(() => vi.clearAllMocks());

  it("plan pro: siempre permitido, sin consultar la base de datos", async () => {
    withPlan((q) => q.plan === "pro");
    expect(await newCompanionPermissions()).toBe(true);
    expect(eqMock).not.toHaveBeenCalled();
  });

  it("límite de 3: permite con 2 companions y bloquea con 3", async () => {
    withPlan((q) => q.feature === "3_companion_limit");
    eqMock.mockResolvedValueOnce(companions(2));
    expect(await newCompanionPermissions()).toBe(true);
    eqMock.mockResolvedValueOnce(companions(3));
    expect(await newCompanionPermissions()).toBe(false);
  });

  it("límite de 10: permite con 9 y bloquea con 10", async () => {
    withPlan((q) => q.feature === "10_companion_limit");
    eqMock.mockResolvedValueOnce(companions(9));
    expect(await newCompanionPermissions()).toBe(true);
    eqMock.mockResolvedValueOnce(companions(10));
    expect(await newCompanionPermissions()).toBe(false);
  });

  it("sin plan ni feature: bloquea incluso con 0 companions", async () => {
    withPlan(() => false);
    eqMock.mockResolvedValueOnce(companions(0));
    expect(await newCompanionPermissions()).toBe(false);
  });

  it("lanza error si Supabase falla", async () => {
    withPlan((q) => q.feature === "3_companion_limit");
    eqMock.mockResolvedValueOnce({ data: null, error: { message: "db down" } });
    await expect(newCompanionPermissions()).rejects.toThrow("db down");
  });
});
