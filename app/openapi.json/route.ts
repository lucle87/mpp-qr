// Tra ve OpenAPI document tai GET /openapi.json - dung chuan mppscan/AgentCash discovery.
// Cac truong bat buoc: info.x-guidance, x-discovery.ownershipProofs,
// moi route tra phi: operationId, summary, x-payment-info (price + protocols),
// requestBody schema (input), 200 schema (output), va responses.402.

import { PRICE, RECIPIENT_ADDRESS, BASE_URL } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const doc = {
    openapi: "3.1.0",
    info: {
      title: "QR Forge",
      version: "1.0.0",
      description:
        "Generate QR codes on demand. Pay-per-call via MPP on Tempo. No API key, no signup.",
      "x-guidance":
        "Use POST /api/qr to generate a QR code. Send a JSON body with a 'data' field (the text or URL to encode). Optional: 'size' (pixels, 128-1024), 'margin' (0-8), 'format' ('png' returns a base64 PNG data URL, 'svg' returns SVG markup). Returns the encoded QR image. Each call costs a small fixed fee paid in stablecoin on Tempo.",
    },
    servers: [{ url: BASE_URL }],
    "x-discovery": {
      // Bang chung so huu: dia chi vi nhan tien. Mppscan dung de xac nhan ban so huu server.
      ownershipProofs: [RECIPIENT_ADDRESS],
    },
    paths: {
      "/api/qr": {
        post: {
          operationId: "generateQr",
          summary: "Generate QR - Create a QR code from text or a URL",
          tags: ["Utility"],
          "x-payment-info": {
            price: { mode: "fixed", amount: PRICE, currency: "USD" },
            protocols: [{ mpp: {} }],
          },
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "string",
                      minLength: 1,
                      maxLength: 2000,
                      description: "Text or URL to encode into the QR code.",
                    },
                    size: {
                      type: "integer",
                      minimum: 128,
                      maximum: 1024,
                      default: 512,
                      description: "Image size in pixels (square).",
                    },
                    margin: {
                      type: "integer",
                      minimum: 0,
                      maximum: 8,
                      default: 2,
                      description: "Quiet-zone margin around the QR.",
                    },
                    format: {
                      type: "string",
                      enum: ["png", "svg"],
                      default: "png",
                      description:
                        "Output format: 'png' (base64 data URL) or 'svg' (markup).",
                    },
                  },
                  required: ["data"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "QR code generated successfully.",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      format: {
                        type: "string",
                        description: "Output format returned ('png' or 'svg').",
                      },
                      image: {
                        type: "string",
                        description:
                          "The QR image. For png: a data URL (data:image/png;base64,...). For svg: SVG markup.",
                      },
                      data: {
                        type: "string",
                        description: "The encoded content.",
                      },
                    },
                    required: ["format", "image"],
                  },
                },
              },
            },
            "402": { description: "Payment Required" },
            "400": { description: "Bad Request - missing or invalid 'data'." },
          },
        },
      },
    },
  };

  return Response.json(doc, {
    headers: { "Cache-Control": "no-store" },
  });
}
