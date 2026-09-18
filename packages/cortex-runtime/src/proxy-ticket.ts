import { createHmac, timingSafeEqual } from "node:crypto";

export type CortexProxyTicket = { workspaceId: string; runtimeId: string; userId: string; expiresAt: number };
const encode = (value: string) => Buffer.from(value).toString("base64url");
const decode = (value: string) => Buffer.from(value, "base64url").toString("utf8");
const signature = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

export const signCortexProxyTicket = (ticket: CortexProxyTicket, secret: string) => {
  if (!secret.trim()) throw new Error("Cortex proxy signing secret is required");
  const payload = encode(JSON.stringify(ticket));
  return `${payload}.${signature(payload, secret)}`;
};

export const verifyCortexProxyTicket = (raw: string, secret: string): CortexProxyTicket | null => {
  try {
    const [payload, supplied] = raw.split(".");
    if (!payload || !supplied) return null;
    const expected = signature(payload, secret);
    if (supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
      return null;
    const ticket = JSON.parse(decode(payload)) as CortexProxyTicket;
    if (
      !ticket.workspaceId ||
      !ticket.runtimeId ||
      !ticket.userId ||
      !Number.isFinite(ticket.expiresAt) ||
      ticket.expiresAt <= Date.now()
    )
      return null;
    return ticket;
  } catch {
    return null;
  }
};
