# Compiled Studio

Compiled Studio bağımsız bir oyun stüdyosudur; arkadaşlarla birlikte oynanınca unutulmaz hikayeler çıkaran oyunlar geliştirir. Bu repo stüdyonun resmi tanıtım sitesidir ve ilk oyunu **How to Pirate**'ı tanıtır: 2-4 oyunculu, fizik odaklı bir co-op korsan macerası.

**Canlı site:** https://compiled-studios.vercel.app

## Sitede neler var

- Tam ekran video arkaplanlı hero ve oyunun tanıtımı
- Stüdyo hakkında bölümü
- Oyunun öne çıkan yönleri: 2-4 kişilik ekip uyumu, fizik komedisi, atmosferik korku, topluluk odaklı alpha
- Oyun akışı: limanda kargo yükle, mürettebatı yönet, tehlikeden kurtul, teslim et ve yeniden donan
- Rakamlarla oyun ve topluluk bağlantıları (Discord, X, YouTube, Instagram)

## Teknoloji

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 3, tailwindcss-animate
- Framer Motion, Lucide ikonları
- Vercel ile yayın (`vercel.json`)

## Kurulum

```bash
git clone https://github.com/tetwy/compiled-studios.git
cd compiled-studios
npm install
npm run dev
```

Üretim derlemesi için:

```bash
npm run build
npm run preview
```
