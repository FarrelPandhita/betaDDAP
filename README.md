# beta-ddap

## Persyaratan dan Instalasi Dependensi

Sebelum menjalankan server, pastikan Anda telah menginstal Node.js di komputer Anda. Anda bisa menginstal seluruh dependensi sekaligus dari `package.json`, atau menginstal library utamanya secara manual.

### 1. Instalasi Otomatis (Rekomendasi)
Untuk menginstal semua dependensi yang dibutuhkan proyek ini secara otomatis, jalankan perintah berikut di terminal:

```bash
npm install
# atau
yarn install
# atau
pnpm install
# atau
bun install
```

### 2. Instalasi Library Spesifik secara Manual
Proyek ini menggunakan beberapa library utama seperti React Flow, Recharts, Zustand, dan Lucide React. Jika Anda membutuhkannya, berikut adalah command untuk menginstal library tersebut secara spesifik:

```bash
npm install @xyflow/react reactflow recharts zustand lucide-react clsx
```

## Cara Menjalankan Server

Setelah semua dependensi berhasil terinstal, Anda dapat menjalankan server pengembangan (development server) dengan perintah berikut:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) 

