# Design System: TrainLog Luxury Noir

Sistem desain resmi untuk **TrainLog Replica**. Berbeda dengan versi aslinya yang menggunakan nuansa sporty neon (dark navy + neon lime), desain ini mengadopsi estetika **Luxury Dark (Noir, Dark Charcoal, & Champagne Gold)** untuk memberikan impresi eksklusif, mewah, dan berkelas tinggi layaknya private trainer & bespoke fitness concierge.

---

## 1. Filosofi & Arah Visual

- **Dominasi Hitam & Abu Tua (Noir & Charcoal)**: Menghilangkan kesan visual murah atau terlalu ramai. Hitam pekat obsidian berpadu dengan lapisan abu tua berlapis (layered charcoal) menciptakan kontras visual yang tenang, maskulin, dan fokus penuh pada data klien.
- **Sentuhan Mewah (Champagne Gold & Warm Metallic)**: Aksen neon lime digantikan dengan sentuhan emas berkelas (*Champagne Gold* / *Brushed Warm Gold*). Emas digunakan secara selektif pada elemen aksi penting (CTA), indikator metrik unggulan, dan sparkline grafik progress.
- **Hairline Borders & Subtle Sheen**: Border tebal dihindari. Komponen menggunakan garis tepi tipis (hairline) bertekstur graphite metalik halus (`rgba(255, 255, 255, 0.08)` hingga `rgba(212, 175, 55, 0.20)` saat hover).
- **Depth & Velvet Shadow**: Bayangan lembut dan dalam (`0 16px 40px rgba(0, 0, 0, 0.70)`) menciptakan ilusi ruang mengambang tanpa bayangan tajam yang kasar.

---

## 2. Palet Token Warna

### A. Latar Belakang & Permukaan (Black & Dark Charcoal)

| Token | Nama Peran | Hex | OKLCH | Kegunaan |
|---|---|---|---|---|
| `--color-bg` | **Obsidian Black** | `#09090b` | `oklch(0.13 0.005 285)` | Background kanvas utama aplikasi (eye-friendly, pekat) |
| `--color-panel` | **Dark Charcoal** | `#131417` | `oklch(0.18 0.008 285)` | Card klien, form login, modal popup, kartu metrik |
| `--color-panel-elevated` | **Slate Graphite** | `#1a1b20` | `oklch(0.22 0.008 285)` | Hover state kartu, menu dropdown, sticky header |
| `--color-line` | **Hairline Border** | `#27282e` | `oklch(0.28 0.008 285)` | Border pembatas kartu, input field, separator tabel |
| `--color-line-subtle` | **Deep Divider** | `#1c1d22` | `oklch(0.22 0.005 285)` | Garis pemisah internal antar list item |

### B. Aksen Mewah (Champagne Gold & Bronze)

| Token | Nama Peran | Hex | OKLCH | Kegunaan |
|---|---|---|---|---|
| `--color-accent` | **Champagne Gold** | `#d4af37` | `oklch(0.78 0.13 85)` | Tombol CTA utama, status aktif, titik grafik terkini |
| `--color-accent-hover` | **Pale Gold Sheen** | `#e2c26e` | `oklch(0.82 0.12 85)` | State hover pada tombol CTA dan link interaktif |
| `--color-accent-dim` | **Warm Gold Tint** | `rgba(212, 175, 55, 0.12)` | - | Area fill sparkline chart, background pill badge aktif |
| `--color-accent-text` | **Deep Velvet Black** | `#0a0a0c` | `oklch(0.12 0.005 285)` | Warna teks di atas tombol emas (kontras tinggi, tajam) |

### C. Tipografi (Pearl White & Titanium Silver)

| Token | Nama Peran | Hex | OKLCH | Kegunaan |
|---|---|---|---|---|
| `--color-text` | **Pearl White** | `#f4f4f6` | `oklch(0.96 0.005 285)` | Heading H1-H3, nama klien, angka metrik utama |
| `--color-dim` | **Titanium Silver** | `#9da1aa` | `oklch(0.68 0.012 285)` | Label form, subtitle, tanggal, status kuota sesi |
| `--color-muted` | **Deep Slate Ash** | `#5d616d` | `oklch(0.48 0.012 285)` | Footnote, placeholder text, ikon sekunder |

### D. Indikator Status (Subdued & Sophisticated)

Status tidak menggunakan warna neon silau, melainkan warna batu permata berkarakter gelap:
- **Success / Optimal**: Deep Emerald `#10b981` / Dark Sage
- **Warning / Grace Period**: Imperial Amber `#f59e0b`
- **Danger / Expired**: Crimson Burgundy `#e11d48`
- **Information**: Sapphire Slate `#38bdf8`

---

## 3. Implementasi CSS (`web/src/index.css`)

```css
@import "tailwindcss";

@theme {
  /* Latar & Permukaan Abu Tua & Hitam */
  --color-bg: oklch(0.13 0.005 285);
  --color-panel: oklch(0.18 0.008 285);
  --color-panel-elevated: oklch(0.22 0.008 285);
  --color-line: oklch(0.28 0.008 285);
  --color-line-subtle: oklch(0.22 0.005 285);

  /* Tipografi */
  --color-text: oklch(0.96 0.005 285);
  --color-dim: oklch(0.68 0.012 285);
  --color-muted: oklch(0.48 0.012 285);

  /* Aksen Mewah */
  --color-accent: oklch(0.78 0.13 85);
  --color-accent-hover: oklch(0.82 0.12 85);
}
```

---

## 4. Panduan Komponen UI

### 1. Tombol Utama (Primary CTA Button)
- **Background**: `bg-accent` (`#d4af37`)
- **Text**: `text-black` (bold, contrast ratio > 10:1)
- **Hover**: Transisi halus ke warna gold lebih terang (`hover:opacity-95 hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]`)
- **Border radius**: `rounded-lg` (8px–10px, proporsional dan tegas)

### 2. Kartu Klien & Panel (Luxury Card)
- **Background**: `bg-panel` (`#131417`)
- **Border**: `border border-line` (`#27282e`)
- **Hover State**: `hover:border-accent/40` atau `hover:border-accent` dengan transisi halus (`transition-all duration-200`)
- **Shadow**: `shadow-[0_8px_30px_rgb(0,0,0,0.5)]`

### 3. Progress Bar & Meter Sesi
- **Track**: `bg-line` (`#27282e`)
- **Indicator Fill**: Gradient halus `from-[#c5a059] to-[#d4af37]` (`bg-accent`)
- Memberikan impresi batangan emas yang terisi secara progresif.

### 4. Input & Form Control
- **Background**: `bg-bg` (`#09090b`)
- **Border**: `border border-line`
- **Focus**: `focus:border-accent focus:ring-1 focus:ring-accent/50 outline-none`

### 5. Sparkline & Grafik Visual
- **Stroke**: Emas `var(--color-accent)` (`#d4af37`) dengan ketebalan 2px
- **Fill**: Area gradasi halus dari `rgba(212, 175, 55, 0.15)` ke transparan di dasar
- **Point Dot**: `circle fill="#d4af37"` dengan ring shadow tipis
