import { describe, it, expect } from "vitest";
import { cn, configureAssistant, getSubjectColor } from "@/lib/utils";

describe("getSubjectColor", () => {
  it("devuelve el color de una materia conocida", () => {
    expect(getSubjectColor("maths")).toBe("#FFDA6E");
  });
  it("devuelve undefined para una materia desconocida", () => {
    expect(getSubjectColor("geography")).toBeUndefined();
  });
});

describe("configureAssistant", () => {
  it("usa el voiceId correcto según voz y estilo", () => {
    const assistant = configureAssistant("male", "casual");
    expect(assistant.voice).toMatchObject({ voiceId: "2BJW5coyhAzSr8STdHbE" });
  });
  it('cae en "sarah" si el estilo no existe', () => {
    const assistant = configureAssistant("female", "inexistente");
    expect(assistant.voice).toMatchObject({ voiceId: "sarah" });
  });
  it("incluye las variables que Vapi reemplaza en el prompt", () => {
    const assistant = configureAssistant("female", "formal");
    const system = (assistant.model as any).messages[0].content;
    expect(system).toContain("{{ topic }}");
    expect(system).toContain("{{ subject }}");
    expect(system).toContain("{{ style }}");
  });
});

describe("cn", () => {
  it("resuelve conflictos de clases de Tailwind", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
});
