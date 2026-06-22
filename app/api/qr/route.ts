// Endpoint tao QR, gate bang MPP.
// Thu tu dung: DOI TIEN TRUOC (402), validate 'data' SAU khi da tra.
// Ep realm = domain chinh (tu BASE_URL) de khop khi dang ky mppscan + agent doc dung.

import { NextRequest } from "next/server";
import QRCode from "qrcode";
import { Mppx, tempo } from "mppx/server";
import {
  active,
  PRICE_AMOUNT,
  RECIPIENT_ADDRESS,
  MPP_SECRET_KEY,
} from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Host domain chinh (tu BASE_URL) de ep realm.
const REALM_HOST = (() => {
  try {
    return new URL(process.env.BASE_URL || "http://localhost:3000").host;
  } catch {
    return "localhost:3000";
  }
})();

const mppx = Mppx.create({
  methods: [
    tempo({
      currency: active.payToken.address,
      recipient: RECIPIENT_ADDRESS,
      testnet: active.testnet,
    }),
  ],
  secretKey: MPP_SECRET_KEY,
  realm: REALM_HOST,
});

type Body = {
  data?: string;
  size?: number;
  margin?: number;
  format?: "png" | "svg";
};

export async function POST(request: NextRequest) {
  let body: Body = {};
  try {
    body = await request.clone().json();
  } catch {
    // bo qua, se validate sau khi tra tien
  }

  // ===== MPP: THU PHI TRUOC (ep host = domain chinh) =====
  let reqForMpp: Request = request;
  try {
    const fixedUrl = new URL(request.url);
    fixedUrl.host = REALM_HOST;
    fixedUrl.protocol = "https:";
    const headers = new Headers(request.headers);
    headers.set("host", REALM_HOST);
    headers.set("x-forwarded-host", REALM_HOST);
    reqForMpp = new Request(fixedUrl.toString(), {
      method: request.method,
      headers,
      body: await request.clone().arrayBuffer(),
    });
  } catch {
    reqForMpp = request;
  }

  const paid = await mppx.tempo.charge({
    amount: PRICE_AMOUNT,
    recipient: RECIPIENT_ADDRESS,
  })(reqForMpp);

  // Chua tra -> tra ve challenge 402.
  if (paid.status === 402) {
    return paid.challenge;
  }

  // ===== Da tra -> gio moi validate 'data' va sinh QR =====
  const data = (body.data || "").toString();
  if (!data.trim()) {
    return Response.json(
      { error: "Missing 'data' to encode." },
      { status: 400 }
    );
  }

  const size = clampInt(body.size, 128, 1024, 512);
  const margin = clampInt(body.margin, 0, 8, 2);
  const format = body.format === "svg" ? "svg" : "png";

  try {
    if (format === "svg") {
      const svg = await QRCode.toString(data, {
        type: "svg",
        margin,
        width: size,
      });
      return paid.withReceipt(
        Response.json({ format: "svg", image: svg, data })
      );
    } else {
      const dataUrl = await QRCode.toDataURL(data, {
        margin,
        width: size,
        errorCorrectionLevel: "M",
      });
      return paid.withReceipt(
        Response.json({ format: "png", image: dataUrl, data })
      );
    }
  } catch (err: any) {
    return Response.json(
      { error: "QR generation failed: " + (err?.message || "unknown") },
      { status: 500 }
    );
  }
}

function clampInt(
  v: unknown,
  min: number,
  max: number,
  def: number
): number {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, Math.round(n)));
}
