import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { verifyCortexProxyTicket } from "@formbricks/cortex-runtime/proxy-ticket";

const port = Number(process.env.PORT ?? 8787);
const hubUrl = (process.env.HUB_API_URL ?? "").replace(/\/$/, "");
const ticketSecret = process.env.CORTEX_PROXY_TICKET_SECRET ?? "";
const allowedOrigin = process.env.CORTEX_ALLOWED_ORIGIN ?? "";
if (!hubUrl || !ticketSecret) throw new Error("HUB_API_URL and CORTEX_PROXY_TICKET_SECRET are required");

const parseCookie = (header: string | undefined, name: string) =>
  header
    ?.split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))
    ?.slice(name.length + 1);
const server = http.createServer((_request, response) => {
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ service: "cortex-gateway", websocket: true }));
});
const wss = new WebSocketServer({ noServer: true, maxPayload: 2 * 1024 * 1024 });

server.on("upgrade", (request, socket, head) => {
  if (allowedOrigin && request.headers.origin !== allowedOrigin) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }
  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const ticket = verifyCortexProxyTicket(
    parseCookie(request.headers.cookie, "cortex_proxy_ticket") ?? url.searchParams.get("ticket") ?? "",
    ticketSecret
  );
  if (!ticket) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }
  const prefix = `/cortex/ws/${encodeURIComponent(ticket.workspaceId)}/${encodeURIComponent(ticket.runtimeId)}`;
  if (!url.pathname.startsWith(prefix)) {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }
  const upstreamPath = url.pathname.slice(prefix.length) || "/api/kernels";
  const upstream = new WebSocket(`${hubUrl}${upstreamPath}${url.search}`, {
    headers: { Authorization: `token ${process.env.HUB_API_KEY ?? ""}` },
  });
  wss.handleUpgrade(request, socket, head, (client) => {
    const closeBoth = () => {
      if (client.readyState < WebSocket.CLOSING) client.close();
      if (upstream.readyState < WebSocket.CLOSING) upstream.close();
    };
    client.on("message", (data, isBinary) => {
      if (upstream.readyState === WebSocket.OPEN) upstream.send(data, { binary: isBinary });
    });
    upstream.on("message", (data, isBinary) => {
      if (client.readyState === WebSocket.OPEN) client.send(data, { binary: isBinary });
    });
    client.on("close", closeBoth);
    upstream.on("close", closeBoth);
    client.on("error", closeBoth);
    upstream.on("error", closeBoth);
  });
});
server.listen(port, "0.0.0.0", () => console.log(`cortex-gateway listening on ${port}`));
