import { describe, it, expect, expectTypeOf } from "vitest";
import {
  companionSchema,
  companionsSearchParamsSchema,
  type CompanionInput,
} from "./companion";
import type { ActionResult } from "@/lib/types";

describe("companionSchema", () => {
  const validData: CompanionInput = {
    name: "Codey the Logic Hacker",
    subject: "coding",
    topic: "If-Else statements",
    voice: "male",
    style: "casual",
    duration: 15,
  };

  it("valida exitosamente un payload completo y válido", () => {
    const result = companionSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  describe("campos requeridos faltantes", () => {
    it("falla si falta name", () => {
      const result = companionSchema.safeParse({ ...validData, name: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Companion is required.");
      }
    });

    it("falla si falta subject", () => {
      const result = companionSchema.safeParse({
        ...validData,
        subject: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Subject is required.");
      }
    });

    it("falla si falta topic", () => {
      const result = companionSchema.safeParse({ ...validData, topic: "" });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Topic is required.");
      }
    });

    it("falla si falta voice", () => {
      const result = companionSchema.safeParse({
        ...validData,
        voice: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Voice is required.");
      }
    });

    it("falla si falta style", () => {
      const result = companionSchema.safeParse({
        ...validData,
        style: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Style is required.");
      }
    });

    it("falla si falta duration", () => {
      const result = companionSchema.safeParse({
        ...validData,
        duration: undefined,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Duration is required.");
      }
    });
  });

  describe("validación de duración", () => {
    it("rechaza duración 0", () => {
      const result = companionSchema.safeParse({ ...validData, duration: 0 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Duration is required.");
      }
    });

    it("rechaza duración negativa", () => {
      const result = companionSchema.safeParse({ ...validData, duration: -10 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Duration is required.");
      }
    });
  });

  describe("validación de subject restringido al enum", () => {
    it("rechaza una materia que no esté en la lista permitida", () => {
      const result = companionSchema.safeParse({
        ...validData,
        subject: "astrology",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Subject is required.");
      }
    });
  });

  describe("companionsSearchParamsSchema", () => {
    it("parsea searchParams válidos y hace coerción de page", () => {
      const result = companionsSearchParamsSchema.safeParse({
        subject: "maths",
        topic: "algebra",
        page: "3",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          subject: "maths",
          topic: "algebra",
          page: 3,
        });
      }
    });

    it("aplica valores por defecto seguros ante parámetros inválidos gracias a catch", () => {
      const result = companionsSearchParamsSchema.safeParse({
        page: "invalid-number",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
      }
    });
  });

  describe("verificación de tipos con expectTypeOf", () => {
    it("asegura los tipos del modelo y de ActionResult", () => {
      expectTypeOf<ActionResult<CompanionInput>>().toEqualTypeOf<
        | { ok: true; data: CompanionInput }
        | { ok: false; error: string }
      >();

      expectTypeOf<CompanionInput["subject"]>().toEqualTypeOf<
        "maths" | "language" | "science" | "history" | "coding" | "economics"
      >();
    });
  });
});
