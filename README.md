# QR Forge - MPP QR code generator on Tempo

Mot server tien ich nho cho AI agent: tao QR code, tra phi per-call qua MPP tren Tempo.
Khong API key, khong signup. Muc tieu: dang ky len mppscan.com de agent tu tim + goi.

## Endpoint

```
GET  /openapi.json      -> discovery document (mppscan doc cai nay)
POST /api/qr            -> tao QR (gate bang MPP 402)
```

POST body:
```json
{ "data": "https://example.com", "size": 512, "margin": 2, "format": "png" }
```
- `data` (bat buoc): text/URL can ma hoa
- `size`: 128-1024 px (mac dinh 512)
- `margin`: 0-8 (mac dinh 2)
- `format`: "png" (data URL base64) hoac "svg"

Tra ve: `{ "format": "png", "image": "data:image/png;base64,...", "data": "..." }`

## Luong MPP

```
Agent POST /api/qr (chua tra)
  -> 402 + header WWW-Authenticate: Payment (challenge)
  -> agent tra phi tren Tempo, goi lai kem credential
  -> server verify -> sinh QR -> tra anh + Payment-Receipt
```

Backend $0 (sinh QR bang thu vien local). Loi nhuan = gia ban ~ toan bo.

## Chay local

```bash
npm install
cp .env.example .env
# Dien RECIPIENT_ADDRESS = vi cua ban
npm run dev
```
Mo http://localhost:3000 va http://localhost:3000/openapi.json

## Cau hinh (.env)

| Bien | Bat buoc | Y nghia |
|---|---|---|
| `RECIPIENT_ADDRESS` | Co | Vi ban nhan tien |
| `TEMPO_NETWORK` | testnet/mainnet | Mac dinh testnet |
| `QR_PRICE` | Co | Gia moi call (vd 0.01) |
| `BASE_URL` | Co (khi deploy) | URL cong khai, vd https://mpp-qr.vercel.app |
| `MPP_SECRET_KEY` | Nen | Secret ky challenge (chuoi ngau nhien) |

## DEPLOY + DANG KY (cac buoc)

### 1. Deploy len Vercel
- Day code len GitHub.
- Vercel -> Import repo -> them Environment Variables (RECIPIENT_ADDRESS, TEMPO_NETWORK, QR_PRICE, BASE_URL, MPP_SECRET_KEY).
- BASE_URL = chinh URL Vercel cap (vd https://mpp-qr.vercel.app), KHONG dau / cuoi.
- Deploy. Kiem tra https://<url>/openapi.json mo duoc.

### 2. Validate truoc khi dang ky
Chay trinh kiem tra cua mppscan/AgentCash:
```bash
npx -y @agentcash/discovery@latest discover "https://<your-url>"
npx -y @agentcash/discovery@latest check "https://<your-url>"
```
Sua den khi het loi. Loi hay gap:
- "Not Found": openapi.json khong mo duoc -> kiem tra BASE_URL/deploy.
- "Input/Output Schema Missing": thieu schema -> da co san trong code.
- "WWW-Authenticate Header Missing": 402 chua dung -> do mppx lo, kiem tra phien ban mppx.
- "Payment/Auth Mode Missing": thieu x-payment-info.protocols -> da co san.

### 3. Dang ky
Vao https://www.mppscan.com/register -> dan URL server (https://<your-url>) -> Add.
Mppscan tu quet /openapi.json + kiem tra 402.

## LUU Y THANG THAN

- `mppx` con moi: phan 402/WWW-Authenticate do no sinh ra. Sau `npm install`, doi chieu docs mppx moi nhat (docs.stripe.com/payments/machine/mpp) va chinh app/api/qr/route.ts neu ten ham doi. Neu validator bao "WWW-Authenticate Header Missing", do la cho can sua.
- Validate TS: `npx tsc --noEmit`.
- Khong test duoc luong tra tien that o local de (can agent/vi tra). Cach test: dung chinh trinh discover cua agentcash, hoac deploy roi cho mot agent thu.
- Thi truong agent hien con rat nho. Day la dat cho som, chap nhan it traffic bay gio.
