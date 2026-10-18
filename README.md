# Rivr UI - Local Copy & Template

Bu proje [Hirael Rivr Template](https://hirael.com/embed/templates/rivr) tasarımının birebir kopyasıdır.
Modern **React 19 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide Icons** mimarisi ile kurulmuştur.

---

## 🚀 Nasıl Çalıştırılır?

### Seçenek 1: Geliştirici Sunucusu (Hot-Reload)
Proje kök dizininde (`rea-main`):
```bash
npm run ui:dev
```
veya doğrudan `rivr-ui` klasöründe:
```bash
cd rivr-ui
npm run dev
```
Tarayıcınızda otomatik olarak **http://localhost:3000** açılacaktır.

---

### Seçenek 2: Tek Tıkla Önizleme (Kurulumsuz)
Herhangi bir terminal veya node sunucusu gerekmeden direkt tarayıcıda açmak için:
- `c:\Users\musag\Desktop\rea-main\preview.html` veya
- `c:\Users\musag\Desktop\rea-main\rea-main\preview.html`
dosyasına çift tıklayıp tarayıcınızda açabilirsiniz.

---

## 📁 Bileşen Yapısı (`rivr-ui/src/components/`)

Tasarımın içeriğini bir sonraki aşamada kolayca değiştirebilmeniz için tüm bölümler modüler ayrılmıştır:

1. **`navbar.tsx`**: Üst menü, logo (RIVR mark), menü bağlantıları ve "Book Demo" butonu.
2. **`hero.tsx`**: Arka plan videosu, ana başlık ("Fluid Asset Streams"), alt açıklama, sol alt istatistik kartı ("5.2K Active Yielders") ve sağ alt kıvrımlı "Documentation" köşesi.
3. **`metrics.tsx`**: Sayısal istatistik bandı ($2.4B TVL, 8.5% Yield, 140K+ Participants, < 2s Finality).
4. **`features.tsx`**: Bento grid şeklinde 4 özellik kartı (Unlock Liquidity, Real-time Yields, Bank-grade, Cross-Chain).
5. **`cta.tsx`**: İkinci video arka planlı çağrı bölümü ("Melt rigid assets into fluid yield.") ve aksiyon butonları.
6. **`footer.tsx`**: Alt bilgi link sütunları (Protocol, Developers, Community) ve telif metni.
7. **`primitives.tsx`**: Butonlar, animasyon helper'ları ve SVG işaretleri.
8. **`public/media/`**: `hero.mp4` ve `cta.mp4` yerel video dosyaları.
