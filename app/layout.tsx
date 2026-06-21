import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QR Forge - MPP QR code generator on Tempo",
  description: "Generate QR codes, pay-per-call via MPP on Tempo.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#0b0d12",
          color: "#e8eaf0",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  );
}
