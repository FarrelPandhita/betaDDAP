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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
