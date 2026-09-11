export interface PrintMediaPreset {
  id: string;
  label: string;
  popularName: string;
  category: 'Cards & Stationery' | 'Flyers & Menus' | 'Publications' | 'Posters & Large Format' | 'Outdoor';
  icon: string;
  widthMeters: number;
  widthCm: number;
  widthInches: number;
  aspectRatioLabel?: string;
  description: string;
  recommendedUse: string;
}

export const PRINT_MEDIA_PRESETS: PrintMediaPreset[] = [
  // Cards & Stationery
  {
    id: 'birthday-card',
    label: 'Birthday Card',
    popularName: '🎂 Birthday Card (5×7")',
    category: 'Cards & Stationery',
    icon: '🎂',
    widthMeters: 0.127,
    widthCm: 12.7,
    widthInches: 5.0,
    aspectRatioLabel: '5×7 in',
    description: 'Standard folded greeting & birthday card',
    recommendedUse: 'Celebrations, animated AR greetings, musical popups'
  },
  {
    id: 'business-card',
    label: 'Business Card',
    popularName: '💼 Business Card (3.5×2")',
    category: 'Cards & Stationery',
    icon: '💼',
    widthMeters: 0.089,
    widthCm: 8.9,
    widthInches: 3.5,
    aspectRatioLabel: '3.5×2 in',
    description: 'Standard pocket business card or conference pass',
    recommendedUse: 'Networking, 3D vCard, interactive contact buttons'
  },
  {
    id: 'postcard',
    label: 'Postcard',
    popularName: '💌 Postcard (6×4")',
    category: 'Cards & Stationery',
    icon: '💌',
    widthMeters: 0.152,
    widthCm: 15.2,
    widthInches: 6.0,
    aspectRatioLabel: '6×4 in',
    description: 'Direct mail postcard, photo print, or travel card',
    recommendedUse: 'Tourism, video postcards, interactive memorabilia'
  },
  {
    id: 'wedding-invitation',
    label: 'Invitation',
    popularName: '💍 Wedding Invitation (6×8")',
    category: 'Cards & Stationery',
    icon: '💍',
    widthMeters: 0.152,
    widthCm: 15.2,
    widthInches: 6.0,
    aspectRatioLabel: '6×8 in',
    description: 'Formal wedding, gala or VIP event invitation',
    recommendedUse: 'Save-the-dates, RSVP buttons, event venue fly-throughs'
  },

  // Flyers & Menus
  {
    id: 'restaurant-menu',
    label: 'Restaurant Menu',
    popularName: '📜 Menu / Flyer (A5)',
    category: 'Flyers & Menus',
    icon: '📜',
    widthMeters: 0.148,
    widthCm: 14.8,
    widthInches: 5.8,
    aspectRatioLabel: '14.8×21 cm',
    description: 'Half-sheet flyer, restaurant table menu, or promo handout',
    recommendedUse: '3D dish previews, food ordering CTAs, chef videos'
  },
  {
    id: 'handout-a6',
    label: 'A6 Mini Flyer',
    popularName: '🎟️ Mini Flyer / Ticket (A6)',
    category: 'Flyers & Menus',
    icon: '🎟️',
    widthMeters: 0.105,
    widthCm: 10.5,
    widthInches: 4.1,
    aspectRatioLabel: '10.5×14.8 cm',
    description: 'Compact pocket flyer, event pass, or retail voucher',
    recommendedUse: 'Retail discounts, coupon scratchcards, concert tickets'
  },

  // Publications & Documents
  {
    id: 'book-cover',
    label: 'Book Cover',
    popularName: '📖 Book Cover (6×9")',
    category: 'Publications',
    icon: '📖',
    widthMeters: 0.152,
    widthCm: 15.2,
    widthInches: 6.0,
    aspectRatioLabel: '6×9 in',
    description: 'Trade paperback novel or textbook front cover',
    recommendedUse: '3D animated character covers, book trailers, author notes'
  },
  {
    id: 'magazine-letter',
    label: 'Magazine / Letter',
    popularName: '📰 Magazine / US Letter',
    category: 'Publications',
    icon: '📰',
    widthMeters: 0.216,
    widthCm: 21.6,
    widthInches: 8.5,
    aspectRatioLabel: '8.5×11 in',
    description: 'Standard US Letter page or full-spread magazine article',
    recommendedUse: 'Editorial AR, interactive print ads, product showcases'
  },
  {
    id: 'a4-document',
    label: 'A4 Page',
    popularName: '📄 A4 Print Document',
    category: 'Publications',
    icon: '📄',
    widthMeters: 0.210,
    widthCm: 21.0,
    widthInches: 8.3,
    aspectRatioLabel: '21×29.7 cm',
    description: 'International standard office sheet, report, or certificate',
    recommendedUse: 'Brochures, diplomas, technical spec sheets with 3D overlays'
  },
  {
    id: 'vinyl-cover',
    label: 'Vinyl Record',
    popularName: '🎵 Vinyl Album Cover (12×12")',
    category: 'Publications',
    icon: '🎵',
    widthMeters: 0.305,
    widthCm: 30.5,
    widthInches: 12.0,
    aspectRatioLabel: '12×12 in',
    description: 'LP album sleeve, vinyl record cover, or square art print',
    recommendedUse: 'Music video playback, 3D animated album art, Spotify links'
  },

  // Posters & Large Format
  {
    id: 'medium-poster',
    label: 'Event Poster',
    popularName: '🖼️ Event Poster (18×24")',
    category: 'Posters & Large Format',
    icon: '🖼️',
    widthMeters: 0.457,
    widthCm: 45.7,
    widthInches: 18.0,
    aspectRatioLabel: '18×24 in',
    description: 'Cinema, music festival, or conference lobby poster',
    recommendedUse: 'Movie trailers, interactive ticket purchase, countdowns'
  },
  {
    id: 'large-poster',
    label: 'Storefront Poster',
    popularName: '🏙️ Large Poster (24×36")',
    category: 'Posters & Large Format',
    icon: '🏙️',
    widthMeters: 0.610,
    widthCm: 61.0,
    widthInches: 24.0,
    aspectRatioLabel: '24×36 in',
    description: 'Retail window display, movie theater one-sheet, or trade booth banner',
    recommendedUse: 'Full-scale interactive portals, shopping showcases'
  },

  // Outdoor
  {
    id: 'outdoor-billboard',
    label: 'Billboard',
    popularName: '🛣️ Highway Billboard (3m / 10ft)',
    category: 'Outdoor',
    icon: '🛣️',
    widthMeters: 3.000,
    widthCm: 300.0,
    widthInches: 118.1,
    aspectRatioLabel: '3×1.5 m',
    description: 'Outdoor street billboard, side-of-building ad, or expo backdrop',
    recommendedUse: 'Monumental architectural AR, vehicle unveilings, public art'
  }
];

export function findMatchingPreset(widthMeters: number): PrintMediaPreset | undefined {
  return PRINT_MEDIA_PRESETS.find(p => Math.abs(p.widthMeters - widthMeters) < 0.005);
}

export function formatPhysicalSize(widthMeters: number, unit: 'm' | 'cm' | 'in' = 'm'): string {
  if (unit === 'cm') {
    return `${(widthMeters * 100).toFixed(1)} cm`;
  }
  if (unit === 'in') {
    return `${(widthMeters * 39.3701).toFixed(1)}"`;
  }
  return `${widthMeters.toFixed(3)} m`;
}
