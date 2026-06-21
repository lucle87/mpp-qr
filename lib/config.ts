// Cau hinh server QR MPP.

export type NetworkName = "mainnet" | "testnet";

export const NETWORK: NetworkName =
  (process.env.TEMPO_NETWORK as NetworkName) || "testnet";

type Net = {
  chainId: number;
  rpcHttp: string;
  explorer: string;
  payToken: { symbol: string; address: `0x${string}`; decimals: number };
  testnet: boolean;
};

export const CONFIG: Record<NetworkName, Net> = {
  mainnet: {
    chainId: 4217,
    rpcHttp: "https://rpc.tempo.xyz",
    explorer: "https://explore.tempo.xyz",
    payToken: {
      symbol: "USDT0",
      address: "0x20c00000000000000000000014f22ca97301eb73",
      decimals: 6,
    },
    testnet: false,
  },
  testnet: {
    chainId: 42431,
    rpcHttp: "https://rpc.moderato.tempo.xyz",
    explorer: "https://explore.testnet.tempo.xyz",
    payToken: {
      symbol: "pathUSD",
      address: "0x20c0000000000000000000000000000000000000",
      decimals: 6,
    },
    testnet: true,
  },
};

export const active = CONFIG[NETWORK];

// Gia moi lan tao QR (don vi token / USD). Chuoi 6 so thap phan cho openapi.
export const PRICE = process.env.QR_PRICE || "0.010000";
export const PRICE_AMOUNT = process.env.QR_PRICE || "0.01"; // cho mppx charge

// Vi nhan tien (PHAI dien trong .env).
export const RECIPIENT_ADDRESS = (process.env.RECIPIENT_ADDRESS ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

// URL cong khai cua server (de dat trong openapi servers + dang ky mppscan).
// Vd: https://mpp-qr.vercel.app  (khong co dau / cuoi)
export const BASE_URL =
  process.env.BASE_URL || "http://localhost:3000";

// Secret ky payment challenge (giu co dinh khi deploy).
export const MPP_SECRET_KEY =
  process.env.MPP_SECRET_KEY || "dev-secret-change-me-in-production-please-32b";
