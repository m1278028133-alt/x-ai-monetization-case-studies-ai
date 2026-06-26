import tls from "node:tls";
import { assertSmtpConfig, config } from "../config.js";
import type { NotificationPayload, PostResult } from "../types/index.js";

interface SmtpSendOptions {
  forceLive?: boolean;
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;
}

function normalizeNewlines(value: string): string {
  return value.replace(/\r?\n/g, "\r\n");
}

function toBase64Lines(value: string): string {
  return Buffer.from(value, "utf8").toString("base64").replace(/.{1,76}/g, "$&\r\n").trimEnd();
}

function escapeAddressName(address: string): string {
  return address.replace(/[<>"\r\n]/g, "");
}

function buildEmailMessage(payload: NotificationPayload): string {
  const from = config.SMTP_FROM || config.SMTP_USER || "";
  const to = config.SMTP_TO || config.NOTIFICATION_EMAIL;
  const actionLink = payload.url ? `\n\n打开 X 发布器：${payload.url}` : "";
  const textBody = `${payload.content}${actionLink}`;
  const headers = [
    `From: ${encodeHeader("X Growth Assistant")} <${from}>`,
    `To: ${escapeAddressName(to)}`,
    `Subject: ${encodeHeader(payload.title)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    `Date: ${new Date().toUTCString()}`
  ];

  return `${headers.join("\r\n")}\r\n\r\n${toBase64Lines(normalizeNewlines(textBody))}\r\n`;
}

function isPositiveCompletion(response: string): boolean {
  return /^[23]\d\d(?:[\s-]|$)/.test(response);
}

function isRetryableResponse(response: string): boolean {
  return /^4\d\d(?:[\s-]|$)/.test(response);
}

function createSecureSocket(): tls.TLSSocket {
  return tls.connect({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    servername: config.SMTP_HOST,
    timeout: config.SMTP_TIMEOUT_MS
  });
}

async function sendCommand(socket: tls.TLSSocket, command?: string): Promise<string> {
  if (command) {
    socket.write(`${command}\r\n`);
  }

  return await new Promise((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    };

    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r\n/).filter(Boolean);
      const lastLine = lines.at(-1);
      if (lastLine && /^\d{3} /.test(lastLine)) {
        cleanup();
        resolve(buffer.trimEnd());
      }
    };

    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };

    const onTimeout = () => {
      cleanup();
      reject(new Error("SMTP connection timed out."));
    };

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

async function expectOk(socket: tls.TLSSocket, stage: string, command?: string): Promise<string> {
  const response = await sendCommand(socket, command);
  if (!isPositiveCompletion(response)) {
    throw new Error(`SMTP ${stage} failed: ${response}`);
  }
  return response;
}

async function sendSmtpMessage(payload: NotificationPayload): Promise<PostResult> {
  const from = config.SMTP_FROM || config.SMTP_USER;
  const to = config.SMTP_TO || config.NOTIFICATION_EMAIL;
  const username = config.SMTP_USER;
  const password = config.SMTP_PASS;
  if (!from || !to || !username || !password) {
    throw new Error("Missing SMTP notification configuration.");
  }

  const socket = createSecureSocket();

  try {
    await expectOk(socket, "connect");
    await expectOk(socket, "hello", `EHLO ${config.SMTP_HELO_NAME}`);
    await expectOk(socket, "auth", "AUTH LOGIN");
    await expectOk(socket, "username", Buffer.from(username, "utf8").toString("base64"));
    await expectOk(socket, "password", Buffer.from(password, "utf8").toString("base64"));
    await expectOk(socket, "mail-from", `MAIL FROM:<${from}>`);
    await expectOk(socket, "rcpt-to", `RCPT TO:<${to}>`);
    await expectOk(socket, "data", "DATA");

    const dataResponse = await sendCommand(socket, `${buildEmailMessage(payload)}.`);
    if (!isPositiveCompletion(dataResponse)) {
      return {
        success: false,
        error: `SMTP data failed: ${dataResponse}`,
        retryable: isRetryableResponse(dataResponse)
      };
    }

    await sendCommand(socket, "QUIT").catch(() => undefined);
    return {
      success: true,
      providerPostId: `smtp-${Date.now()}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP delivery failed.",
      retryable: true
    };
  } finally {
    socket.end();
  }
}

export async function sendSmtpNotification(
  payload: NotificationPayload,
  options: SmtpSendOptions = {}
): Promise<PostResult> {
  if (config.DRY_RUN && !options.forceLive) {
    return {
      success: true,
      providerPostId: `smtp-dry-run-${Date.now()}`
    };
  }

  assertSmtpConfig();
  return await sendSmtpMessage(payload);
}
