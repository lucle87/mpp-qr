import { active, PRICE, BASE_URL } from "@/lib/config";

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: 28, marginBottom: 6 }}>QR Forge</h1>
      <p style={{ color: "#8a8fa0", marginTop: 0 }}>
        Generate QR codes on demand. Pay-per-call via MPP on {active.testnet ? "Tempo Testnet" : "Tempo Mainnet"}.
        No API key, no signup.
      </p>

      <div
        style={{
          background: "#14171f",
          border: "1px solid #232733",
          borderRadius: 14,
          padding: 20,
          marginTop: 24,
        }}
      >
        <h2 style={{ fontSize: 16, marginTop: 0 }}>For agents</h2>
        <p style={{ color: "#8a8fa0", fontSize: 14 }}>
          Discovery document:{" "}
          <a href="/openapi.json" style={{ color: "#6cf0c2" }}>
            {BASE_URL}/openapi.json
          </a>
        </p>
        <pre
          style={{
            background: "#0b0d12",
            border: "1px solid #232733",
            borderRadius: 10,
            padding: 14,
            overflowX: "auto",
            fontSize: 13,
          }}
        >{`POST ${BASE_URL}/api/qr
Content-Type: application/json

{ "data": "https://example.com", "size": 512, "format": "png" }

Price: ${PRICE} USD per call (paid via MPP on Tempo)`}</pre>
      </div>

      <p style={{ color: "#8a8fa0", fontSize: 13, marginTop: 24 }}>
        Unpaid requests receive HTTP 402 with an MPP payment challenge. After
        payment, the QR image is returned with a payment receipt.
      </p>
    </main>
  );
}
