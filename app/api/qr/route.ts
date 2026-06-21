// Endpoint tao QR, gate bang MPP.
// Chua tra tien -> 402 kem WWW-Authenticate: Payment (challenge MPP).
// Da tra -> sinh QR (local, mien phi) + tra ve kem receipt.

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

const mppx = Mppx.create({
  methods: [
    tempo({
      currency: active.payToken.address,
      recipient: RECIPIENT_ADDRESS,
      testnet: active.testnet,
    }),
  ],
  secretKey: MPP_SECRET_KEY,
});

type Body = {
  data?: string;
  size?: number;
  margin?: number;
  format?: "png" | "svg";
};

export async function POST(request: NextRequest) {
  // Doc input truoc (clone vi mppx se doc body cho viec tra tien).
  let body: Body = {};
  try {
    body = await request.clone().json();
  } catch {
    // bo qua
  }

  const data = (body.data || "").toString();
  if (!data.trim()) {
    return Response.json(
      { error: "Missing 'data' to encode." },
      { status: 400 }
    );
  }

  // ===== MPP: thu phi truoc khi tra ket qua =====
  const paid = await mppx.tempo.charge({
    amount: PRICE_AMOUNT,
    recipient: RECIPIENT_ADDRESS,
  })(request);

  // Chua tra -> tra ve challenge 402 (co WWW-Authenticate: Payment).
  if (paid.status === 402) {
    return paid.challenge;
  }

  // ===== Da tra -> sinh QR =====
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
