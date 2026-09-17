export interface PrintMediaPreset {
  id: string;
  label: string;
  popularName: string;
  category: 
    | 'Standard Paper' 
    | 'Posters & Displays' 
    | 'Cards & Stationery' 
    | 'Books & Magazines' 
    | 'Flyers & Menus' 
    | 'Packaging & Merch' 
    | 'Retail & Storefront' 
    | 'Newspaper & Ads';
  icon: string;
  widthMeters: number;
  widthCm: number;
  widthInches: number;
  aspectRatioLabel?: string;
  description: string;
  recommendedUse: string;
}

export const PRINT_MEDIA_PRESETS: PrintMediaPreset[] = [
  // --- Standard Paper & Documents ---
  {
    id: 'a4-document',
    label: 'A4 Document',
    popularName: '📄 A4 Standard Sheet (21 × 29.7 cm)',
    category: 'Standard Paper',
    icon: '📄',
    widthMeters: 0.210,
    widthCm: 21.0,
    widthInches: 8.27,
    aspectRatioLabel: '21 × 29.7 cm',
    description: 'Standard office printer sheet, reports, forms, and certificates',
    recommendedUse: 'Brochures, diplomas, contracts, letters, technical sheets'
  },
  {
    id: 'us-letter',
    label: 'US Letter Page',
    popularName: '🇺🇸 US Letter (8.5 × 11 in)',
    category: 'Standard Paper',
    icon: '🇺🇸',
    widthMeters: 0.2159,
    widthCm: 21.59,
    widthInches: 8.5,
    aspectRatioLabel: '8.5 × 11 in',
    description: 'Standard North American office document and letterhead sheet',
    recommendedUse: 'Official documents, business proposals, resumes'
  },
  {
    id: 'a3-paper',
    label: 'A3 Sheet / Ledger',
    popularName: '📑 A3 Medium Sheet (29.7 × 42 cm)',
    category: 'Standard Paper',
    icon: '📑',
    widthMeters: 0.297,
    widthCm: 29.7,
    widthInches: 11.69,
    aspectRatioLabel: '29.7 × 42 cm',
    description: 'Double A4 size, diagrams, architectural plans, and small posters',
    recommendedUse: 'Architectural schematics, visual infographics, charts'
  },
  {
    id: 'a5-paper',
    label: 'A5 Notebook Page',
    popularName: '📝 A5 Booklet / Planner (14.8 × 21 cm)',
    category: 'Standard Paper',
    icon: '📝',
    widthMeters: 0.148,
    widthCm: 14.8,
    widthInches: 5.83,
    aspectRatioLabel: '14.8 × 21 cm',
    description: 'Compact notebook sheet, diary, journal, or event program',
    recommendedUse: 'Interactive planners, event itineraries, pocket guidebooks'
  },
  {
    id: 'us-legal',
    label: 'US Legal Page',
    popularName: '⚖️ US Legal (8.5 × 14 in)',
    category: 'Standard Paper',
    icon: '⚖️',
    widthMeters: 0.2159,
    widthCm: 21.59,
    widthInches: 8.5,
    aspectRatioLabel: '8.5 × 14 in',
    description: 'Legal contracts, real estate disclosures, and long forms',
    recommendedUse: 'Legal documents, property records, contracts'
  },
  {
    id: 'us-tabloid',
    label: 'US Tabloid / Ledger',
    popularName: '📰 US Tabloid (11 × 17 in)',
    category: 'Standard Paper',
    icon: '📰',
    widthMeters: 0.2794,
    widthCm: 27.94,
    widthInches: 11.0,
    aspectRatioLabel: '11 × 17 in',
    description: 'Double Letter size, office newsletters, proof prints, mini posters',
    recommendedUse: 'Visual dashboards, financial spreadsheets, proof prints'
  },

  // --- Packaging & Merchandise ---
  {
    id: 'pkg-small-box',
    label: 'Product Box (Small)',
    popularName: '📦 Product Box - Small (15 × 15 cm)',
    category: 'Packaging & Merch',
    icon: '📦',
    widthMeters: 0.150,
    widthCm: 15.0,
    widthInches: 5.91,
    aspectRatioLabel: '15 × 15 cm',
    description: 'Standard cosmetic, perfume, software, or small electronics package box face',
    recommendedUse: 'Interactive 3D unboxing, gadget previews, cosmetic packaging'
  },
  {
    id: 'pkg-large-box',
    label: 'Retail Shipping Box',
    popularName: '🏬 Retail Box - Large (30 × 40 cm)',
    category: 'Packaging & Merch',
    icon: '🏬',
    widthMeters: 0.300,
    widthCm: 30.0,
    widthInches: 11.81,
    aspectRatioLabel: '30 × 40 cm',
    description: 'Shoebox, appliance carton, or retail store product package',
    recommendedUse: 'E-commerce retail boxes, footwear boxes, appliance demos'
  },
  {
    id: 'pkg-tshirt',
    label: 'T-Shirt Chest Graphic',
    popularName: '👕 T-Shirt Print Area (30 × 40 cm)',
    category: 'Packaging & Merch',
    icon: '👕',
    widthMeters: 0.300,
    widthCm: 30.0,
    widthInches: 11.81,
    aspectRatioLabel: '30 × 40 cm',
    description: 'Standard screen-printed graphic area on apparel chest/back',
    recommendedUse: '3D apparel try-on, apparel merch preview, clothing branding'
  },
  {
    id: 'pkg-sticker-sheet',
    label: 'Sticker Decal Sheet',
    popularName: '🏷️ Sticker Sheet (10 × 15 cm)',
    category: 'Packaging & Merch',
    icon: '🏷️',
    widthMeters: 0.100,
    widthCm: 10.0,
    widthInches: 3.94,
    aspectRatioLabel: '10 × 15 cm',
    description: 'Die-cut vinyl sticker sheet, brand decal, or laptop sticker',
    recommendedUse: 'Pop-out 3D vinyl stickers, collectibles, promotional decals'
  },
  {
    id: 'pkg-can-bottle-label',
    label: 'Beverage Can / Bottle Label',
    popularName: '🍾 Bottle / Can Label (10 × 15 cm)',
    category: 'Packaging & Merch',
    icon: '🍾',
    widthMeters: 0.100,
    widthCm: 10.0,
    widthInches: 3.94,
    aspectRatioLabel: '10 × 15 cm',
    description: 'Wine bottle label, craft beer can wrap, or soda bottle sticker',
    recommendedUse: '3D beverage visualization, wine bottle storytelling'
  },
  {
    id: 'pkg-coffee-mug',
    label: 'Coffee Mug Wrap',
    popularName: '☕ Coffee Mug Print (20 × 9 cm)',
    category: 'Packaging & Merch',
    icon: '☕',
    widthMeters: 0.200,
    widthCm: 20.0,
    widthInches: 7.87,
    aspectRatioLabel: '20 × 9 cm',
    description: 'Ceramic coffee mug wrap graphic or insulated travel tumbler',
    recommendedUse: 'Merchandise mockups, personalized gift preview'
  },

  // --- Cards & Stationery ---
  {
    id: 'business-card',
    label: 'Standard Business Card',
    popularName: '💼 Business Card (3.5 × 2 in / 8.9 × 5.1 cm)',
    category: 'Cards & Stationery',
    icon: '💼',
    widthMeters: 0.089,
    widthCm: 8.9,
    widthInches: 3.5,
    aspectRatioLabel: '8.9 × 5.1 cm',
    description: 'Standard pocket business card or corporate contact card',
    recommendedUse: 'Networking, 3D digital vCard, interactive social links'
  },
  {
    id: 'id-lanyard-badge',
    label: 'ID Pass / Lanyard Badge',
    popularName: '🪪 ID Badge / Event Pass (8.6 × 5.4 cm)',
    category: 'Cards & Stationery',
    icon: '🪪',
    widthMeters: 0.086,
    widthCm: 8.6,
    widthInches: 3.39,
    aspectRatioLabel: '8.6 × 5.4 cm',
    description: 'Credit-card sized conference pass, VIP lanyard badge, security card',
    recommendedUse: 'Conference agendas, event AR access passes, speaker bios'
  },
  {
    id: 'postcard',
    label: 'Standard Postcard',
    popularName: '💌 Postcard (6 × 4 in / 15.2 × 10.2 cm)',
    category: 'Cards & Stationery',
    icon: '💌',
    widthMeters: 0.152,
    widthCm: 15.2,
    widthInches: 6.0,
    aspectRatioLabel: '6 × 4 in',
    description: 'Direct mail postcard, souvenir photo print, or tourism card',
    recommendedUse: 'Tourism cards, video postcards, interactive souvenirs'
  },
  {
    id: 'birthday-card',
    label: 'Greeting / Birthday Card',
    popularName: '🎂 Greeting Card (5 × 7 in / 12.7 × 17.8 cm)',
    category: 'Cards & Stationery',
    icon: '🎂',
    widthMeters: 0.127,
    widthCm: 12.7,
    widthInches: 5.0,
    aspectRatioLabel: '5 × 7 in',
    description: 'Standard folded holiday, thank you, or birthday greeting card',
    recommendedUse: 'Celebration greetings, animated 3D popups, musical notes'
  },
  {
    id: 'wedding-invitation',
    label: 'Wedding / Gala Invite',
    popularName: '💍 Wedding Invitation (6 × 8 in / 15.2 × 20.3 cm)',
    category: 'Cards & Stationery',
    icon: '💍',
    widthMeters: 0.152,
    widthCm: 15.2,
    widthInches: 6.0,
    aspectRatioLabel: '6 × 8 in',
    description: 'Formal wedding, gala, or luxury event invitation card',
    recommendedUse: 'Save-the-date cards, RSVP buttons, venue 3D fly-throughs'
  },

  // --- Posters & Large Displays ---
  {
    id: 'poster-small-a2',
    label: 'Small Poster (A2)',
    popularName: '🖼️ Small Poster A2 (42 × 59.4 cm)',
    category: 'Posters & Displays',
    icon: '🖼️',
    widthMeters: 0.420,
    widthCm: 42.0,
    widthInches: 16.54,
    aspectRatioLabel: '42 × 59.4 cm',
    description: 'Wall art poster, classroom chart, or lobby event notice',
    recommendedUse: 'Infographics, classroom visual aids, art gallery prints'
  },
  {
    id: 'medium-poster',
    label: 'Standard Event Poster',
    popularName: '🎬 Event Poster (18 × 24 in / 45.7 × 61 cm)',
    category: 'Posters & Displays',
    icon: '🎬',
    widthMeters: 0.457,
    widthCm: 45.7,
    widthInches: 18.0,
    aspectRatioLabel: '18 × 24 in',
    description: 'Concert poster, movie theater promo, or festival announcement',
    recommendedUse: 'Movie trailers, ticket purchase buttons, band videos'
  },
  {
    id: 'large-poster',
    label: 'Storefront Poster (24×36")',
    popularName: '🏙️ Storefront Poster (24 × 36 in / 61 × 91 cm)',
    category: 'Posters & Displays',
    icon: '🏙️',
    widthMeters: 0.610,
    widthCm: 61.0,
    widthInches: 24.0,
    aspectRatioLabel: '24 × 36 in',
    description: 'Retail window display, cinema one-sheet poster, booth backdrop',
    recommendedUse: 'Interactive storefront portals, shopping showcases'
  },
  {
    id: 'expo-rollup-banner',
    label: 'Roll-Up Exhibition Banner',
    popularName: '🎪 Roll-Up Expo Banner (85 × 200 cm)',
    category: 'Posters & Displays',
    icon: '🎪',
    widthMeters: 0.850,
    widthCm: 85.0,
    widthInches: 33.46,
    aspectRatioLabel: '85 × 200 cm',
    description: 'Retractable trade show banner stand or conference entrance sign',
    recommendedUse: 'Trade show booth AR, interactive company presentations'
  },
  {
    id: 'outdoor-billboard',
    label: 'Outdoor Billboard Stand',
    popularName: '🛣️ Highway Billboard (3 m / 10 ft)',
    category: 'Posters & Displays',
    icon: '🛣️',
    widthMeters: 3.000,
    widthCm: 300.0,
    widthInches: 118.1,
    aspectRatioLabel: '3 × 1.5 m',
    description: 'Large outdoor roadside billboard, building wall banner, transit sign',
    recommendedUse: 'Monumental architectural AR, vehicle reveal ads'
  },

  // --- Books, Magazines & Comics ---
  {
    id: 'book-trade-paperback',
    label: 'Trade Paperback Book',
    popularName: '📚 Trade Book Cover (6 × 9 in / 15.2 × 22.9 cm)',
    category: 'Books & Magazines',
    icon: '📚',
    widthMeters: 0.1524,
    widthCm: 15.24,
    widthInches: 6.0,
    aspectRatioLabel: '6 × 9 in',
    description: 'Industry standard non-fiction, novel, and self-published book cover',
    recommendedUse: 'Animated book covers, author video introductions, 3D popups'
  },
  {
    id: 'magazine-letter',
    label: 'Magazine Full Page',
    popularName: '📖 Magazine Page (8.5 × 11 in / 21.6 × 27.9 cm)',
    category: 'Books & Magazines',
    icon: '📖',
    widthMeters: 0.216,
    widthCm: 21.6,
    widthInches: 8.5,
    aspectRatioLabel: '8.5 × 11 in',
    description: 'Standard consumer and trade lifestyle magazine full page',
    recommendedUse: 'Editorial AR, interactive fashion ads, 3D product previews'
  },
  {
    id: 'book-comic-graphic-novel',
    label: 'Comic Book / Graphic Novel',
    popularName: '🦸 Comic Book (6.6 × 10.25 in)',
    category: 'Books & Magazines',
    icon: '🦸',
    widthMeters: 0.1683,
    widthCm: 16.83,
    widthInches: 6.625,
    aspectRatioLabel: '6.6 × 10.25 in',
    description: 'Standard American comic book, graphic novel, or manga compilation',
    recommendedUse: 'Animated comic panels, voiced character dialogues, sound FX'
  },
  {
    id: 'book-manga-tankobon',
    label: 'Manga Volume (Tankobon)',
    popularName: '🌸 Manga Cover (5 × 7.5 in / 12.7 × 19 cm)',
    category: 'Books & Magazines',
    icon: '🌸',
    widthMeters: 0.127,
    widthCm: 12.7,
    widthInches: 5.0,
    aspectRatioLabel: '5 × 7.5 in',
    description: 'Standard Japanese manga volume cover trim size',
    recommendedUse: 'Anime opening videos, animated speedlines, voiceover dialog'
  },
  {
    id: 'book-childrens-square',
    label: "Children's Picture Book",
    popularName: "🧸 Children's Book (8 × 8 in / 20.3 × 20.3 cm)",
    category: 'Books & Magazines',
    icon: '🧸',
    widthMeters: 0.2032,
    widthCm: 20.32,
    widthInches: 8.0,
    aspectRatioLabel: '8 × 8 in',
    description: "Square children's illustrated storybook or early reader book",
    recommendedUse: 'Talking animal characters, educational games, sound effects'
  },

  // --- Flyers, Menus & Brochures ---
  {
    id: 'restaurant-menu',
    label: 'Restaurant Menu / Flyer',
    popularName: '📜 Restaurant Menu (A5 / 14.8 × 21 cm)',
    category: 'Flyers & Menus',
    icon: '📜',
    widthMeters: 0.148,
    widthCm: 14.8,
    widthInches: 5.8,
    aspectRatioLabel: '14.8 × 21 cm',
    description: 'Half-sheet flyer, restaurant table menu, or promotional handout',
    recommendedUse: '3D dish previews, food ordering CTAs, chef videos'
  },
  {
    id: 'flyer-trifold',
    label: 'Tri-Fold Pamphlet Brochure',
    popularName: '📂 Tri-Fold Brochure (10 × 21 cm Panel)',
    category: 'Flyers & Menus',
    icon: '📂',
    widthMeters: 0.100,
    widthCm: 10.0,
    widthInches: 3.94,
    aspectRatioLabel: '10 × 21 cm',
    description: 'Standard 3-panel folded promotional brochure (Letter / A4 folded)',
    recommendedUse: 'Tourist pamphlets, real estate tours, medical clinic guides'
  },
  {
    id: 'handout-a6',
    label: 'A6 Mini Handout / Voucher',
    popularName: '🎟️ Mini Flyer / Voucher (10.5 × 14.8 cm)',
    category: 'Flyers & Menus',
    icon: '🎟️',
    widthMeters: 0.105,
    widthCm: 10.5,
    widthInches: 4.1,
    aspectRatioLabel: '10.5 × 14.8 cm',
    description: 'Compact hand-out flyer, discount voucher, or event entry ticket',
    recommendedUse: 'Retail discounts, scratchcard coupons, concert tickets'
  },
  {
    id: 'vinyl-cover',
    label: 'Vinyl Album Cover (12×12")',
    popularName: '🎵 Vinyl Record Sleeve (12 × 12 in / 30.5 cm)',
    category: 'Flyers & Menus',
    icon: '🎵',
    widthMeters: 0.305,
    widthCm: 30.5,
    widthInches: 12.0,
    aspectRatioLabel: '12 × 12 in',
    description: 'LP album sleeve, vinyl record cover, or square art print',
    recommendedUse: 'Music video playback, animated album art, Spotify links'
  },

  // --- Retail & Storefront ---
  {
    id: 'retail-shelf-tag',
    label: 'Retail Price / Shelf Tag',
    popularName: '🏷️ Shelf Price Tag (6 × 4 cm)',
    category: 'Retail & Storefront',
    icon: '🏷️',
    widthMeters: 0.060,
    widthCm: 6.0,
    widthInches: 2.36,
    aspectRatioLabel: '6 × 4 cm',
    description: 'Supermarket price shelf label, apparel hangtag, or barcode tag',
    recommendedUse: 'AR price comparisons, nutritional info popups, customer reviews'
  },
  {
    id: 'table-tent-card',
    label: 'Table Tent Stand',
    popularName: '⛺ Restaurant Table Tent (10 × 15 cm)',
    category: 'Retail & Storefront',
    icon: '⛺',
    widthMeters: 0.100,
    widthCm: 10.0,
    widthInches: 3.94,
    aspectRatioLabel: '10 × 15 cm',
    description: 'Folded table promo tent in cafe, restaurant bar, or hotel counter',
    recommendedUse: 'Daily specials, drink menus, QR feedback forms'
  },
  {
    id: 'window-decal',
    label: 'Storefront Window Decal',
    popularName: '🏪 Window Store Decal (100 × 150 cm)',
    category: 'Retail & Storefront',
    icon: '🏪',
    widthMeters: 1.000,
    widthCm: 100.0,
    widthInches: 39.37,
    aspectRatioLabel: '100 × 150 cm',
    description: 'Large glass window vinyl sticker, store entrance promo decal',
    recommendedUse: 'Interactive window shopping, virtual avatar greetings'
  },

  // --- Newspaper & Media Ads ---
  {
    id: 'newspaper-broadsheet-full',
    label: 'Broadsheet Newspaper Full',
    popularName: '📰 Broadsheet Full Page (15 × 22.75 in)',
    category: 'Newspaper & Ads',
    icon: '📰',
    widthMeters: 0.381,
    widthCm: 38.1,
    widthInches: 15.0,
    aspectRatioLabel: '15 × 22.75 in',
    description: 'Full page daily major newspaper (NYT, WSJ, The Times, Guardian)',
    recommendedUse: 'Front-page AR takeovers, interactive brand stories'
  },
  {
    id: 'newspaper-tabloid-full',
    label: 'Tabloid Newspaper Full',
    popularName: '🗞️ Tabloid Newspaper Page (11 × 17 in)',
    category: 'Newspaper & Ads',
    icon: '🗞️',
    widthMeters: 0.2794,
    widthCm: 27.94,
    widthInches: 11.0,
    aspectRatioLabel: '11 × 17 in',
    description: 'Full page compact tabloid newspaper (Daily Mail, NY Post, Metro)',
    recommendedUse: 'Entertainment covers, sports feature stories'
  }
];

export function findMatchingPreset(widthMeters: number): PrintMediaPreset | undefined {
  return PRINT_MEDIA_PRESETS.find(p => Math.abs(p.widthMeters - widthMeters) < 0.005);
}

export function formatPhysicalSize(widthMeters: number, unit: 'm' | 'cm' | 'in' | 'mm' = 'cm'): string {
  if (unit === 'cm') {
    return `${(widthMeters * 100).toFixed(1)} cm`;
  }
  if (unit === 'mm') {
    return `${(widthMeters * 1000).toFixed(0)} mm`;
  }
  if (unit === 'in') {
    return `${(widthMeters * 39.3701).toFixed(1)}"`;
  }
  return `${widthMeters.toFixed(3)} m`;
}

