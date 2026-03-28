import type { Progress } from "./progress";

const PREFIX = "cog1:";
const VERSION = 1;

function checksum(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function encodeBase64Url(json: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(json, "utf8").toString("base64url");
  }
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(s: string): string {
  let pad = s.replace(/-/g, "+").replace(/_/g, "/");
  while (pad.length % 4) pad += "=";
  if (typeof Buffer !== "undefined") {
    return Buffer.from(pad, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(pad)));
}

export function encodeProgress(p: Progress): string {
  const payload = {
    v: VERSION,
    c: p.completedLevels,
    x: p.xp ?? 0,
    l: p.lastLevelId,
    w: p.lastWorldId,
  };
  const json = JSON.stringify(payload);
  const csum = checksum(json);
  const wrapped = { ...payload, _: csum };
  return PREFIX + encodeBase64Url(JSON.stringify(wrapped));
}

export function decodeProgress(code: string): Progress {
  const trimmed = code.trim();
  if (!trimmed.startsWith(PREFIX)) {
    throw new Error("Invalid progress code");
  }
  const raw = trimmed.slice(PREFIX.length);
  let parsed: {
    v: number;
    c: Record<string, number>;
    x: number;
    l?: string;
    w?: string;
    _: number;
  };
  try {
    parsed = JSON.parse(decodeBase64Url(raw));
  } catch {
    throw new Error("Could not decode progress code");
  }
  if (parsed.v !== VERSION) {
    throw new Error("Unsupported code version");
  }
  const { _: csum, ...rest } = parsed;
  const withoutChecksum = {
    v: rest.v,
    c: rest.c,
    x: rest.x,
    l: rest.l,
    w: rest.w,
  };
  const json = JSON.stringify(withoutChecksum);
  if (checksum(json) !== csum) {
    throw new Error("Progress code checksum failed");
  }
  return {
    completedLevels: parsed.c ?? {},
    xp: parsed.x ?? 0,
    lastLevelId: parsed.l,
    lastWorldId: parsed.w,
  };
}
