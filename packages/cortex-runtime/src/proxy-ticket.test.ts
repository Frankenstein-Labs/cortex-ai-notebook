import { describe, expect, it } from "vitest";
import { signCortexProxyTicket, verifyCortexProxyTicket } from "./proxy-ticket";

describe("Cortex proxy tickets", () => {
  const ticket = {
    workspaceId: "workspace_1",
    runtimeId: "runtime_1",
    userId: "user_1",
    expiresAt: Date.now() + 60_000,
  };
  it("round-trips a signed ticket", () =>
    expect(verifyCortexProxyTicket(signCortexProxyTicket(ticket, "a".repeat(32)), "a".repeat(32))).toEqual(
      ticket
    ));
  it("rejects tampering and wrong secrets", () => {
    const signed = signCortexProxyTicket(ticket, "a".repeat(32));
    expect(verifyCortexProxyTicket(`${signed}x`, "a".repeat(32))).toBeNull();
    expect(verifyCortexProxyTicket(signed, "b".repeat(32))).toBeNull();
  });
  it("rejects expired tickets", () =>
    expect(
      verifyCortexProxyTicket(
        signCortexProxyTicket({ ...ticket, expiresAt: Date.now() - 1 }, "a".repeat(32)),
        "a".repeat(32)
      )
    ).toBeNull());
});
