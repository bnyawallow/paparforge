import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { SceneObject } from '../../types';
import { useEditorStore } from '../../store/useEditorStore';

export interface SplineIconMetadata {
  id: string;
  name: string;
  category: 
    | 'Sales & Discounts' 
    | 'Trust & Guarantees' 
    | 'Call to Action' 
    | 'Merchandising & Packaging' 
    | 'Food & Beverage' 
    | 'Finance & Payments' 
    | 'Tech & Creative' 
    | 'Social & Media' 
    | 'Gaming & Awards' 
    | 'Nature & Eco';
  previewEmoji: string;
  previewImage?: string;
  modelUrl?: string;
  defaultColor: string;
  secondaryColor: string;
  description: string;
  materialStyle: 'clay' | 'glossy' | 'metallic' | 'glass' | 'neon';
  tags: string[];
}

export const SPLINE_3D_ICONS: SplineIconMetadata[] = [
  // ==============================================================================================
  // 1. SALES & DISCOUNTS (PRINT ADVERTISING ESSENTIALS)
  // ==============================================================================================
  {
    id: 'sale_tag',
    name: '3D Hanging SALE Tag',
    category: 'Sales & Discounts',
    previewEmoji: '🏷️',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Beveled retail price tag with eyelet ring and bold 3D SALE lettering',
    materialStyle: 'glossy',
    tags: ['sale', 'discount', 'price', 'tag', 'print', 'deal', 'promo', 'offer']
  },
  {
    id: 'discount_percent',
    name: '3D Gold Percent (%) Sign',
    category: 'Sales & Discounts',
    previewEmoji: '％',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Volumetric 3D percentage glyph with rounded edges and high-gloss gold finish',
    materialStyle: 'metallic',
    tags: ['percent', 'discount', 'sale', 'promo', 'ad', 'rate', 'off']
  },
  {
    id: 'fifty_percent_off',
    name: '3D "50% OFF" Badge',
    category: 'Sales & Discounts',
    previewEmoji: '💥',
    defaultColor: '#dc2626',
    secondaryColor: '#fbbf24',
    description: 'Dual-layer advertising starburst badge highlighting half-price promotions',
    materialStyle: 'glossy',
    tags: ['50%', 'half price', 'sale', 'clearance', 'badge', 'flyer', 'ad']
  },
  {
    id: 'mega_sale_badge',
    name: '3D Mega Sale Starburst',
    category: 'Sales & Discounts',
    previewEmoji: '🌟',
    defaultColor: '#ea580c',
    secondaryColor: '#fde047',
    description: '12-point starburst explosive badge for high-energy headline promotions',
    materialStyle: 'glossy',
    tags: ['mega sale', 'starburst', 'explosion', 'promo', 'ad', 'special']
  },
  {
    id: 'coupon_voucher',
    name: '3D Perforated Coupon Ticket',
    category: 'Sales & Discounts',
    previewEmoji: '🎟️',
    defaultColor: '#8b5cf6',
    secondaryColor: '#ffffff',
    description: 'Perforated discount coupon voucher with stub notch and barcode stamp',
    materialStyle: 'clay',
    tags: ['coupon', 'voucher', 'ticket', 'promo code', 'discount', 'print']
  },
  {
    id: 'hot_deal_flame',
    name: '3D Hot Deal Flame',
    category: 'Sales & Discounts',
    previewEmoji: '🔥',
    defaultColor: '#f97316',
    secondaryColor: '#facc15',
    description: 'Vibrant multi-tiered flame icon symbolizing limited hot deals',
    materialStyle: 'neon',
    tags: ['hot deal', 'fire', 'flame', 'trending', 'flash sale', 'urgent']
  },
  {
    id: 'clearance_stamp',
    name: '3D Clearance Seal Stamp',
    category: 'Sales & Discounts',
    previewEmoji: '⭕',
    defaultColor: '#b91c1c',
    secondaryColor: '#fca5a5',
    description: 'Circular embossed rubber stamp badge for final clearance and liquidation',
    materialStyle: 'clay',
    tags: ['clearance', 'stamp', 'seal', 'liquidation', 'outlet', 'approved']
  },
  {
    id: 'limited_offer_clock',
    name: '3D Flash Sale Clock',
    category: 'Sales & Discounts',
    previewEmoji: '⏰',
    defaultColor: '#0284c7',
    secondaryColor: '#e0f2fe',
    description: 'Alarm countdown timer clock for flash sales and limited-time offers',
    materialStyle: 'glossy',
    tags: ['clock', 'time', 'limited offer', 'flash sale', 'timer', 'urgent', 'deadline']
  },
  {
    id: 'new_arrival_star',
    name: '3D "NEW" Arrival Crest',
    category: 'Sales & Discounts',
    previewEmoji: '✨',
    defaultColor: '#10b981',
    secondaryColor: '#ffffff',
    description: 'Emerald sparkling 3D crest highlighting fresh seasonal product arrivals',
    materialStyle: 'glossy',
    tags: ['new', 'arrival', 'fresh', 'latest', 'crest', 'launch', 'badge']
  },
  {
    id: 'best_seller_ribbon',
    name: '3D Best Seller Ribbon',
    category: 'Sales & Discounts',
    previewEmoji: '🎗️',
    defaultColor: '#eab308',
    secondaryColor: '#1e3a8a',
    description: 'Golden rosette medallion with dual hanging navy heraldic ribbons',
    materialStyle: 'metallic',
    tags: ['best seller', 'top rated', 'ribbon', 'rosette', 'medal', 'award']
  },

  // ==============================================================================================
  // 2. TRUST, QUALITY & GUARANTEES (PRINT AD ENDORSEMENTS)
  // ==============================================================================================
  {
    id: 'guarantee_shield',
    name: '3D 100% Guaranteed Shield',
    category: 'Trust & Guarantees',
    previewEmoji: '🛡️',
    defaultColor: '#eab308',
    secondaryColor: '#15803d',
    description: 'Golden heavy armored shield badge guaranteeing customer satisfaction',
    materialStyle: 'metallic',
    tags: ['guarantee', 'warranty', 'shield', 'trust', 'security', 'quality']
  },
  {
    id: 'five_stars_rating',
    name: '3D 5-Star Rating Array',
    category: 'Trust & Guarantees',
    previewEmoji: '⭐⭐⭐⭐⭐',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Curved row of 5 gleaming golden stars representing 5-star customer reviews',
    materialStyle: 'metallic',
    tags: ['rating', '5 star', 'reviews', 'trust', 'stars', 'satisfaction']
  },
  {
    id: 'certified_seal',
    name: '3D Certified Quality Seal',
    category: 'Trust & Guarantees',
    previewEmoji: '🏅',
    defaultColor: '#d97706',
    secondaryColor: '#ffffff',
    description: 'Notary embossed quality seal with scalloped edge for premium trust proof',
    materialStyle: 'metallic',
    tags: ['certified', 'quality', 'seal', 'official', 'authentic', 'verified']
  },
  {
    id: 'verified_check',
    name: '3D Verified Check Badge',
    category: 'Trust & Guarantees',
    previewEmoji: '✅',
    defaultColor: '#2563eb',
    secondaryColor: '#ffffff',
    description: '3D thick checkmark emblem in a rounded pill badge for verification',
    materialStyle: 'glossy',
    tags: ['verified', 'check', 'approved', 'authentic', 'trusted', 'official']
  },
  {
    id: 'eco_organic_leaf',
    name: '3D 100% Eco / Organic Leaf',
    category: 'Nature & Eco',
    previewEmoji: '🍃',
    defaultColor: '#16a34a',
    secondaryColor: '#86efac',
    description: 'Volumetric botanical leaf crest for organic, eco-friendly, and sustainable goods',
    materialStyle: 'glossy',
    tags: ['eco', 'organic', 'green', 'leaf', 'nature', 'sustainable', 'vegan']
  },
  {
    id: 'secure_warranty',
    name: '3D Lifetime Warranty Lock',
    category: 'Trust & Guarantees',
    previewEmoji: '🔒',
    defaultColor: '#475569',
    secondaryColor: '#38bdf8',
    description: 'Heavy duty steel padlock emblem guaranteeing 100% secure warranty protection',
    materialStyle: 'metallic',
    tags: ['warranty', 'lock', 'secure', 'protection', 'lifetime guarantee']
  },
  {
    id: 'trophy_cup',
    name: '3D Gold Champion Trophy',
    category: 'Gaming & Awards',
    previewEmoji: '🏆',
    defaultColor: '#eab308',
    secondaryColor: '#1e293b',
    description: 'Grand champion golden trophy cup with dual handles on pedestal base',
    materialStyle: 'metallic',
    tags: ['trophy', 'award', 'winner', 'first place', 'champion', 'best']
  },

  // ==============================================================================================
  // 3. CALL TO ACTION & SOCIAL (PRINT AD CTAS)
  // ==============================================================================================
  {
    id: 'qr_code_cube',
    name: '3D Holographic QR Cube',
    category: 'Call to Action',
    previewEmoji: '📱',
    defaultColor: '#06b6d4',
    secondaryColor: '#1e1b4b',
    description: 'Floating 3D QR matrix cube with scanner corner markers for print AR triggers',
    materialStyle: 'neon',
    tags: ['qr', 'qr code', 'scan', 'interactive', 'ar trigger', 'cta', 'camera']
  },
  {
    id: 'megaphone_speaker',
    name: '3D Announcement Megaphone',
    category: 'Call to Action',
    previewEmoji: '📢',
    defaultColor: '#ec4899',
    secondaryColor: '#ffffff',
    description: 'Bullhorn loudspeaker megaphone for loud advertising promotions and announcements',
    materialStyle: 'glossy',
    tags: ['megaphone', 'announcement', 'loudspeaker', 'marketing', 'cta', 'broadcast']
  },
  {
    id: 'geo_pin_location',
    name: '3D Store Map Location Pin',
    category: 'Call to Action',
    previewEmoji: '📍',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Volumetric location map pin with concentric target base for store finders',
    materialStyle: 'glossy',
    tags: ['map pin', 'location', 'store locator', 'gps', 'directions', 'visit us']
  },
  {
    id: 'phone_call_cta',
    name: '3D "Call Now" Telephone',
    category: 'Call to Action',
    previewEmoji: '📞',
    defaultColor: '#10b981',
    secondaryColor: '#ffffff',
    description: 'Handset telephone receiver callout badge prompting users to call immediately',
    materialStyle: 'glossy',
    tags: ['call now', 'phone', 'telephone', 'contact', 'hotline', 'support']
  },
  {
    id: 'web_globe_cta',
    name: '3D World Website Globe',
    category: 'Call to Action',
    previewEmoji: '🌐',
    defaultColor: '#3b82f6',
    secondaryColor: '#60a5fa',
    description: 'Glossy world sphere with latitude grid lines for website URLs and global reach',
    materialStyle: 'glass',
    tags: ['website', 'globe', 'url', 'web', 'internet', 'online', 'global']
  },
  {
    id: 'social_heart_bubble',
    name: '3D Floating Heart Bubble',
    category: 'Social & Media',
    previewEmoji: '💖',
    defaultColor: '#f43f5e',
    secondaryColor: '#fda4af',
    description: 'Volumetric glossy love heart bubble for social followers and favorite brands',
    materialStyle: 'glossy',
    tags: ['heart', 'love', 'like', 'social', 'favorite', 'instagram']
  },
  {
    id: 'social_thumbs_up',
    name: '3D Thumbs-Up Recommend',
    category: 'Social & Media',
    previewEmoji: '👍',
    defaultColor: '#2563eb',
    secondaryColor: '#ffffff',
    description: 'Friendly 3D hand giving a prominent thumbs-up recommendation for ad proof',
    materialStyle: 'clay',
    tags: ['thumbs up', 'like', 'recommend', 'social', 'approve', 'facebook']
  },
  {
    id: 'camera_lens_cta',
    name: '3D AR Camera Lens Target',
    category: 'Call to Action',
    previewEmoji: '📷',
    defaultColor: '#334155',
    secondaryColor: '#f97316',
    description: 'Multi-element optical camera lens inviting customers to point and scan with AR',
    materialStyle: 'metallic',
    tags: ['camera', 'lens', 'ar scan', 'instagram', 'photo', 'capture', 'cta']
  },
  {
    id: 'retail_storefront',
    name: '3D Retail Shopfront Awning',
    category: 'Call to Action',
    previewEmoji: '🏬',
    defaultColor: '#dc2626',
    secondaryColor: '#ffffff',
    description: 'Classic striped canvas awning shopfront for local in-store retail promotions',
    materialStyle: 'clay',
    tags: ['storefront', 'shop', 'retail', 'store', 'in-store', 'boutique', 'market']
  },

  // ==============================================================================================
  // 4. MERCHANDISING, PACKAGING & DELIVERY
  // ==============================================================================================
  {
    id: 'shopping_cart',
    name: '3D Supermarket Shopping Cart',
    category: 'Merchandising & Packaging',
    previewEmoji: '🛒',
    defaultColor: '#2563eb',
    secondaryColor: '#94a3b8',
    description: 'Metallic wire shopping cart with rolling casters and ergonomic handle',
    materialStyle: 'metallic',
    tags: ['shopping cart', 'cart', 'buy', 'checkout', 'supermarket', 'ecommerce']
  },
  {
    id: 'shopping_bag_duo',
    name: '3D Luxury Shopping Bags',
    category: 'Merchandising & Packaging',
    previewEmoji: '🛍️',
    defaultColor: '#db2777',
    secondaryColor: '#f472b6',
    description: 'Pair of designer boutique shopping bags with folded paper gussets and cord handles',
    materialStyle: 'glossy',
    tags: ['shopping bag', 'bag', 'fashion', 'luxury', 'boutique', 'retail']
  },
  {
    id: 'gift_box_lux',
    name: '3D Premium Gift Box Ribbon',
    category: 'Merchandising & Packaging',
    previewEmoji: '🎁',
    defaultColor: '#dc2626',
    secondaryColor: '#fbbf24',
    description: 'Luxurious gift package wrapped in cross-satin ribbon and a voluminous bow',
    materialStyle: 'glossy',
    tags: ['gift', 'present', 'box', 'holiday', 'special', 'giveaway', 'reward']
  },
  {
    id: 'delivery_truck',
    name: '3D Fast Delivery Courier Van',
    category: 'Merchandising & Packaging',
    previewEmoji: '🚚',
    defaultColor: '#0284c7',
    secondaryColor: '#ffffff',
    description: 'Express shipping transport truck highlighting same-day and free delivery',
    materialStyle: 'glossy',
    tags: ['delivery', 'truck', 'van', 'free shipping', 'fast shipping', 'express', 'courier']
  },
  {
    id: 'shipping_package_box',
    name: '3D Sealed Cardboard Parcel',
    category: 'Merchandising & Packaging',
    previewEmoji: '📦',
    defaultColor: '#b45309',
    secondaryColor: '#f59e0b',
    description: 'Reinforced corrugated cardboard parcel box with tape seal and shipping label',
    materialStyle: 'clay',
    tags: ['package', 'parcel', 'box', 'cardboard', 'shipping', 'order', 'delivery']
  },
  {
    id: 'display_podium',
    name: '3D Product Showcase Podium',
    category: 'Merchandising & Packaging',
    previewEmoji: '🏛️',
    defaultColor: '#1e293b',
    secondaryColor: '#eab308',
    description: 'Cylindrical marble-rimmed pedestal stage for spotlighting hero advertisement products',
    materialStyle: 'metallic',
    tags: ['podium', 'pedestal', 'showcase', 'stage', 'display', 'product stand']
  },
  {
    id: 'barcode_price_scanner',
    name: '3D Barcode Price Tag',
    category: 'Merchandising & Packaging',
    previewEmoji: '🏷️',
    defaultColor: '#18181b',
    secondaryColor: '#ef4444',
    description: 'Commercial UPC barcode badge with red laser scanner beam',
    materialStyle: 'glossy',
    tags: ['barcode', 'upc', 'price tag', 'scan', 'checkout', 'sku']
  },

  // ==============================================================================================
  // 5. FOOD & BEVERAGE PRINT ADVERTISING
  // ==============================================================================================
  {
    id: 'coffee_cup_ad',
    name: '3D Artisan Coffee Cup',
    category: 'Food & Beverage',
    previewEmoji: '☕',
    defaultColor: '#78350f',
    secondaryColor: '#ffffff',
    description: 'Eco paper takeout coffee cup with heat sleeve and sip lid for cafe ads',
    materialStyle: 'clay',
    tags: ['coffee', 'cafe', 'cup', 'latte', 'espresso', 'drink', 'beverage']
  },
  {
    id: 'soda_can_ad',
    name: '3D Refreshing Soda Can',
    category: 'Food & Beverage',
    previewEmoji: '🥤',
    defaultColor: '#e11d48',
    secondaryColor: '#e2e8f0',
    description: 'Metallic aluminum beverage soda can with embossed top tab',
    materialStyle: 'metallic',
    tags: ['soda', 'can', 'drink', 'beverage', 'aluminum', 'refreshment']
  },
  {
    id: 'perfume_bottle_ad',
    name: '3D Luxury Perfume Bottle',
    category: 'Merchandising & Packaging',
    previewEmoji: '🧴',
    defaultColor: '#ec4899',
    secondaryColor: '#fde047',
    description: 'Facet-cut crystal glass fragrance atomizer bottle with gold pump cap',
    materialStyle: 'glass',
    tags: ['perfume', 'fragrance', 'cosmetics', 'beauty', 'luxury', 'bottle', 'scent']
  },
  {
    id: 'burger_food_ad',
    name: '3D Gourmet Burger',
    category: 'Food & Beverage',
    previewEmoji: '🍔',
    defaultColor: '#d97706',
    secondaryColor: '#16a34a',
    description: 'Deluxe layered burger with sesame bun, beef patty, cheese, and lettuce',
    materialStyle: 'clay',
    tags: ['burger', 'food', 'restaurant', 'fast food', 'gourmet', 'meal', 'menu']
  },

  // ==============================================================================================
  // 6. FINANCE & TRANSACTION BADGES
  // ==============================================================================================
  {
    id: 'credit_card_tap',
    name: '3D Contactless Credit Card',
    category: 'Finance & Payments',
    previewEmoji: '💳',
    defaultColor: '#2563eb',
    secondaryColor: '#eab308',
    description: 'EMV chip payment card with wireless NFC wave arcs and raised card numbers',
    materialStyle: 'metallic',
    tags: ['credit card', 'payment', 'nfc', 'contactless', 'checkout', 'visa', 'mastercard']
  },
  {
    id: 'gold_bars_stack',
    name: '3D Stack of Gold Bullion',
    category: 'Finance & Payments',
    previewEmoji: '🪙',
    defaultColor: '#eab308',
    secondaryColor: '#fef08a',
    description: 'Pyramid stack of 3 polished 999.9 fine gold bullion ingots',
    materialStyle: 'metallic',
    tags: ['gold', 'bullion', 'bars', 'wealth', 'finance', 'luxury', 'investment']
  },
  {
    id: 'piggy_bank',
    name: '3D Savings Piggy Bank',
    category: 'Finance & Payments',
    previewEmoji: '🐷',
    defaultColor: '#f472b6',
    secondaryColor: '#fbbf24',
    description: 'Glossy porcelain piggy bank with golden coin entering the top slot',
    materialStyle: 'glossy',
    tags: ['piggy bank', 'savings', 'money', 'investment', 'finance', 'budget']
  },
  {
    id: 'money_bag_cash',
    name: '3D Cash Money Bag',
    category: 'Finance & Payments',
    previewEmoji: '💰',
    defaultColor: '#15803d',
    secondaryColor: '#86efac',
    description: 'Stitched linen bank money sack tied with cord and bold Dollar emblem',
    materialStyle: 'clay',
    tags: ['money bag', 'cash', 'dollars', 'jackpot', 'prize', 'bank', 'wealth']
  },
  {
    id: 'digital_wallet',
    name: '3D Mobile Digital Wallet',
    category: 'Finance & Payments',
    previewEmoji: '👛',
    defaultColor: '#8b5cf6',
    secondaryColor: '#22c55e',
    description: 'Smartphone with virtual debit cards popping up for instantaneous mobile payments',
    materialStyle: 'glossy',
    tags: ['digital wallet', 'apple pay', 'google pay', 'mobile pay', 'wallet', 'fintech']
  },

  // ==============================================================================================
  // 7. TECH & CREATIVE MARKETING ELEMENTS
  // ==============================================================================================
  {
    id: 'ai_sparkle_wand',
    name: '3D AI Sparkle Magic Wand',
    category: 'Tech & Creative',
    previewEmoji: '🪄',
    defaultColor: '#a855f7',
    secondaryColor: '#fde047',
    description: 'Glowing generative AI magic wand emitting orbiting luminous sparkle stars',
    materialStyle: 'neon',
    tags: ['ai', 'sparkle', 'magic', 'smart', 'generate', 'auto', 'creative', 'wand']
  },
  {
    id: 'rocket_launch',
    name: '3D Campaign Rocket Launch',
    category: 'Tech & Creative',
    previewEmoji: '🚀',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Sleek aerodynamic rocket ship bursting with thruster fire for marketing launches',
    materialStyle: 'glossy',
    tags: ['rocket', 'launch', 'startup', 'boost', 'speed', 'campaign', 'growth']
  },
  {
    id: 'idea_lightbulb',
    name: '3D Glowing Idea Lightbulb',
    category: 'Tech & Creative',
    previewEmoji: '💡',
    defaultColor: '#eab308',
    secondaryColor: '#64748b',
    description: 'Warm luminous glass incandescent bulb with visible tungsten filament loop',
    materialStyle: 'neon',
    tags: ['lightbulb', 'idea', 'innovation', 'smart', 'creative', 'solution', 'bright']
  },
  {
    id: 'video_play_reel',
    name: '3D Video Play Reel Slate',
    category: 'Social & Media',
    previewEmoji: '🎬',
    defaultColor: '#dc2626',
    secondaryColor: '#ffffff',
    description: 'Beveled 3D triangular play button on movie production clapperboard slate',
    materialStyle: 'glossy',
    tags: ['video', 'play', 'movie', 'trailer', 'watch', 'media', 'film', 'youtube']
  },
  {
    id: 'headphones_sound',
    name: '3D Hi-Fi Audio Headphones',
    category: 'Tech & Creative',
    previewEmoji: '🎧',
    defaultColor: '#8b5cf6',
    secondaryColor: '#1e1b4b',
    description: 'Padded acoustic studio reference headphones for podcast and music promotions',
    materialStyle: 'glossy',
    tags: ['headphones', 'audio', 'sound', 'music', 'podcast', 'listen', 'hifi']
  },
  {
    id: 'smartphone',
    name: '3D Smartphone Mockup',
    category: 'Tech & Creative',
    previewEmoji: '📱',
    defaultColor: '#3b82f6',
    secondaryColor: '#1e293b',
    description: 'Sleek smartphone device bezel frame for mobile app screenshots and AR portals',
    materialStyle: 'glossy',
    tags: ['smartphone', 'phone', 'mobile', 'device', 'app', 'mockup', 'screen']
  },

  // ==============================================================================================
  // 8. GAMING & SYSTEM UI CLASSICS
  // ==============================================================================================
  {
    id: 'gem',
    name: '3D Diamond Gemstone',
    category: 'Gaming & Awards',
    previewEmoji: '💎',
    defaultColor: '#06b6d4',
    secondaryColor: '#67e8f9',
    description: 'Facet-cut crystal diamond gemstone with prismatic refractions',
    materialStyle: 'glass',
    tags: ['diamond', 'gem', 'crystal', 'premium', 'luxury', 'jewel']
  },
  {
    id: 'star',
    name: '3D Golden Star Medal',
    category: 'Gaming & Awards',
    previewEmoji: '⭐',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef08a',
    description: 'Beveled 5-point star with radiant golden metallic sheen',
    materialStyle: 'metallic',
    tags: ['star', 'favorite', 'highlight', 'gold', 'medal', 'rank']
  },
  {
    id: 'bell',
    name: '3D Notification Bell',
    category: 'Social & Media',
    previewEmoji: '🔔',
    defaultColor: '#f59e0b',
    secondaryColor: '#fef3c7',
    description: 'Polished golden alert bell reminding customers about updates and drops',
    materialStyle: 'metallic',
    tags: ['bell', 'alert', 'notification', 'remind', 'subscribe', 'updates']
  },
  {
    id: 'mail',
    name: '3D Mail Newsletter Envelope',
    category: 'Social & Media',
    previewEmoji: '✉️',
    defaultColor: '#ef4444',
    secondaryColor: '#ffffff',
    description: 'Folded paper letter envelope with V-shaped seal flap and postal stamp',
    materialStyle: 'glossy',
    tags: ['mail', 'newsletter', 'email', 'inbox', 'subscribe', 'contact']
  },
  {
    id: 'chat_bubble',
    name: '3D Live Chat Bubble',
    category: 'Social & Media',
    previewEmoji: '💬',
    defaultColor: '#3b82f6',
    secondaryColor: '#ffffff',
    description: 'Puffy speech bubble with tail and message indicator dots for support chat',
    materialStyle: 'clay',
    tags: ['chat', 'support', 'message', 'helpdesk', 'live chat', 'conversation']
  },
  {
    id: 'crown',
    name: '3D VIP Royal Crown',
    category: 'Gaming & Awards',
    previewEmoji: '👑',
    defaultColor: '#eab308',
    secondaryColor: '#ef4444',
    description: 'Golden royal crown with 5 spikes and embedded ruby gemstone spheres',
    materialStyle: 'metallic',
    tags: ['crown', 'vip', 'royal', 'king', 'exclusive', 'premium', 'member']
  }
];

// Material selector helper
function IconMaterial({ color, secondaryColor, style }: { color: string; secondaryColor: string; style: string }) {
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;

  if (style === 'glass') {
    return (
      <meshPhysicalMaterial
        color={color}
        transmission={0.85}
        opacity={0.92}
        transparent
        roughness={0.08}
        ior={1.5}
        thickness={0.6}
        clearcoat={1}
        clearcoatRoughness={0.08}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'metallic') {
    return (
      <meshStandardMaterial
        color={color}
        metalness={0.92}
        roughness={0.18}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'neon') {
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.65}
        roughness={0.2}
        metalness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'glossy') {
    return (
      <meshPhysicalMaterial
        color={color}
        clearcoat={1.0}
        clearcoatRoughness={0.08}
        roughness={0.18}
        metalness={0.15}
        wireframe={storeWireframe}
      />
    );
  }

  // Fallback 'clay' matte style
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.45}
      metalness={0.08}
      wireframe={storeWireframe}
    />
  );
}

// Accent Material selector helper
function AccentMaterial({ color, style }: { color: string; style: string }) {
  const storeWireframe = useEditorStore(state => state.wireframeEnabled) || false;

  if (style === 'glass') {
    return (
      <meshPhysicalMaterial
        color={color}
        transmission={0.6}
        transparent
        opacity={0.8}
        roughness={0.15}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'metallic') {
    return (
      <meshStandardMaterial
        color={color}
        metalness={0.95}
        roughness={0.15}
        wireframe={storeWireframe}
      />
    );
  }

  if (style === 'neon') {
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.85}
        roughness={0.1}
        wireframe={storeWireframe}
      />
    );
  }

  return (
    <meshStandardMaterial
      color={color}
      roughness={0.3}
      metalness={0.2}
      wireframe={storeWireframe}
    />
  );
}

// 3D Procedural Mesh Builders for each print advertising & classic icon
function ProceduralIconShape({ iconType, color, secondaryColor, style }: { iconType: string; color: string; secondaryColor: string; style: string }) {
  switch (iconType) {
    // --------------------------------------------------------------------------------------------
    // PRINT ADVERTISING & COMMERCIAL MESHES
    // --------------------------------------------------------------------------------------------
    case 'sale_tag':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Main Price Tag Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.9, 0.08]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Top Pointed Tag Extension */}
          <mesh position={[0, 0.55, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.49, 0.49, 0.08]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Eyelet Metal Ring */}
          <mesh position={[0, 0.65, 0.05]}>
            <torusGeometry args={[0.08, 0.025, 16, 32]} />
            <AccentMaterial color="#e2e8f0" style="metallic" />
          </mesh>
          {/* Embossed Inner Border */}
          <mesh position={[0, 0, 0.045]}>
            <boxGeometry args={[0.55, 0.75, 0.02]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'discount_percent':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Diagonal Slash Bar */}
          <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 1.1, 0.2]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Top-Left Ring */}
          <mesh position={[-0.32, 0.32, 0]}>
            <torusGeometry args={[0.18, 0.08, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Bottom-Right Ring */}
          <mesh position={[0.32, -0.32, 0]}>
            <torusGeometry args={[0.18, 0.08, 16, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );

    case 'fifty_percent_off':
    case 'mega_sale_badge':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Starburst Layer 1 */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 0.12, 12]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Starburst Layer 2 (Rotated) */}
          <mesh position={[0, 0, 0.02]} rotation={[0, 0, Math.PI / 12]}>
            <cylinderGeometry args={[0.55, 0.55, 0.12, 12]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style={style} />
          </mesh>
          {/* Center Inner Disc */}
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.42, 0.42, 0.04, 32]} />
            <AccentMaterial color={color} style="glossy" />
          </mesh>
          {/* Center Emblem Sphere */}
          <mesh position={[0, 0, 0.12]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <AccentMaterial color="#ffffff" style="metallic" />
          </mesh>
        </group>
      );

    case 'coupon_voucher':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Main Ticket Base */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[1.0, 0.6, 0.06]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
          {/* Perforated Divider Line */}
          <mesh position={[0.15, 0, 0.035]}>
            <boxGeometry args={[0.03, 0.55, 0.02]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
          {/* Left Stub Stamp */}
          <mesh position={[-0.22, 0, 0.035]}>
            <boxGeometry args={[0.45, 0.4, 0.02]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
          {/* Right Barcode Lines */}
          <mesh position={[0.32, 0, 0.035]}>
            <boxGeometry args={[0.22, 0.4, 0.02]} />
            <AccentMaterial color="#1e293b" style="matte" />
          </mesh>
        </group>
      );

    case 'hot_deal_flame':
    case 'flame':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Outer Flame */}
          <mesh position={[0, -0.05, 0]}>
            <coneGeometry args={[0.45, 0.9, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="neon" />
          </mesh>
          {/* Inner Flame Core */}
          <mesh position={[0, -0.15, 0.04]}>
            <coneGeometry args={[0.26, 0.55, 32]} />
            <AccentMaterial color={secondaryColor} style="neon" />
          </mesh>
        </group>
      );

    case 'guarantee_shield':
    case 'shield':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Main Crest Body */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.7, 0.65, 0.15]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Lower Point */}
          <mesh position={[0, -0.3, 0]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.5, 0.5, 0.15]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Inner Shield Star / Check */}
          <mesh position={[0, -0.02, 0.09]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'five_stars_rating':
      return (
        <group position={[0, 0, 0.35]}>
          {[-0.5, -0.25, 0, 0.25, 0.5].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, Math.sin(i * 0.5 - 1) * 0.08, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.06, 5]} />
              <IconMaterial color="#f59e0b" secondaryColor="#fef08a" style="metallic" />
            </mesh>
          ))}
        </group>
      );

    case 'certified_seal':
    case 'best_seller_ribbon':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Scalloped Gold Medallion */}
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.1, 24]} />
            <IconMaterial color="#eab308" secondaryColor="#fef08a" style="metallic" />
          </mesh>
          {/* Left Ribbon Tail */}
          <mesh position={[-0.14, -0.32, -0.02]} rotation={[0, 0, Math.PI / 10]}>
            <boxGeometry args={[0.14, 0.45, 0.04]} />
            <AccentMaterial color="#1e3a8a" style="glossy" />
          </mesh>
          {/* Right Ribbon Tail */}
          <mesh position={[0.14, -0.32, -0.02]} rotation={[0, 0, -Math.PI / 10]}>
            <boxGeometry args={[0.14, 0.45, 0.04]} />
            <AccentMaterial color="#1e3a8a" style="glossy" />
          </mesh>
        </group>
      );

    case 'verified_check':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Circular Badge Outer */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.1, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Check Short Leg */}
          <mesh position={[-0.12, -0.06, 0.06]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.24, 0.04]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
          {/* Check Long Leg */}
          <mesh position={[0.08, 0.04, 0.06]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.1, 0.42, 0.04]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
        </group>
      );

    case 'qr_code_cube':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Holographic Matrix Cube */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <IconMaterial color="#0f172a" secondaryColor={color} style="glossy" />
          </mesh>
          {/* QR Corner Markers */}
          <mesh position={[-0.2, 0.2, 0.36]}>
            <boxGeometry args={[0.18, 0.18, 0.04]} />
            <AccentMaterial color={color} style="neon" />
          </mesh>
          <mesh position={[0.2, 0.2, 0.36]}>
            <boxGeometry args={[0.18, 0.18, 0.04]} />
            <AccentMaterial color={color} style="neon" />
          </mesh>
          <mesh position={[-0.2, -0.2, 0.36]}>
            <boxGeometry args={[0.18, 0.18, 0.04]} />
            <AccentMaterial color={color} style="neon" />
          </mesh>
        </group>
      );

    case 'megaphone_speaker':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Megaphone Cone */}
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.05, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.15, 0.65, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.18, -0.32, 0]} rotation={[0, 0, Math.PI / 8]}>
            <cylinderGeometry args={[0.05, 0.05, 0.35, 16]} />
            <AccentMaterial color="#1e293b" style="clay" />
          </mesh>
          {/* Back Sound Cap */}
          <mesh position={[-0.4, 0, 0]}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'geo_pin_location':
    case 'pin':
      return (
        <group position={[0, 0, 0.5]}>
          {/* Pin Sphere Head */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Inner Pin Dot */}
          <mesh position={[0, 0.2, 0.3]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
          {/* Pointed Cone Base */}
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.3, 0.45, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Ground Contact Target Ring */}
          <mesh position={[0, -0.42, 0]}>
            <torusGeometry args={[0.22, 0.03, 16, 32]} />
            <AccentMaterial color={color} style="neon" />
          </mesh>
        </group>
      );

    case 'shopping_cart':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Basket Box Wireframe */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.65, 0.45, 0.4]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Handle */}
          <mesh position={[-0.38, 0.22, 0]} rotation={[0, 0, -Math.PI / 4]}>
            <cylinderGeometry args={[0.03, 0.03, 0.25, 16]} />
            <AccentMaterial color="#ef4444" style="clay" />
          </mesh>
          {/* 4 Wheels */}
          {[-0.2, 0.2].map((x, i) => (
            <React.Fragment key={i}>
              <mesh position={[x, -0.22, 0.16]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <AccentMaterial color="#1e293b" style="clay" />
              </mesh>
              <mesh position={[x, -0.22, -0.16]}>
                <sphereGeometry args={[0.07, 16, 16]} />
                <AccentMaterial color="#1e293b" style="clay" />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      );

    case 'shopping_bag_duo':
    case 'shopping_bag':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Main Bag */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.55, 0.65, 0.3]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Top Handle Loop */}
          <mesh position={[0, 0.35, 0]}>
            <torusGeometry args={[0.16, 0.03, 16, 32, Math.PI]} />
            <AccentMaterial color="#ffffff" style="clay" />
          </mesh>
        </group>
      );

    case 'gift_box_lux':
    case 'gift':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Box Base */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.65, 0.65, 0.65]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Cross Ribbon Vertical */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.14, 0.67, 0.67]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
          {/* Cross Ribbon Horizontal */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.67, 0.14, 0.67]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
          {/* Top Bow Spheres */}
          <mesh position={[-0.1, 0.36, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
          <mesh position={[0.1, 0.36, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <AccentMaterial color={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'delivery_truck':
      return (
        <group position={[0, 0, 0.3]}>
          {/* Cargo Container */}
          <mesh position={[-0.12, 0.08, 0]}>
            <boxGeometry args={[0.65, 0.45, 0.42]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Driver Cabin */}
          <mesh position={[0.3, -0.02, 0]}>
            <boxGeometry args={[0.3, 0.35, 0.38]} />
            <AccentMaterial color={secondaryColor} style="glossy" />
          </mesh>
          {/* Wheels */}
          {[-0.3, 0.05, 0.32].map((x, i) => (
            <React.Fragment key={i}>
              <mesh position={[x, -0.22, 0.18]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
                <AccentMaterial color="#0f172a" style="matte" />
              </mesh>
              <mesh position={[x, -0.22, -0.18]}>
                <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
                <AccentMaterial color="#0f172a" style="matte" />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      );

    case 'shipping_package_box':
      return (
        <group position={[0, 0, 0.35]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <IconMaterial color="#b45309" secondaryColor="#f59e0b" style="clay" />
          </mesh>
          {/* Sealing Tape */}
          <mesh position={[0, 0, 0.36]}>
            <boxGeometry args={[0.2, 0.72, 0.02]} />
            <AccentMaterial color="#f59e0b" style="clay" />
          </mesh>
        </group>
      );

    case 'credit_card_tap':
    case 'credit_card':
      return (
        <group position={[0, 0, 0.35]} rotation={[Math.PI / 12, 0, 0]}>
          {/* Card Body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.9, 0.58, 0.04]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* EMV Gold Chip */}
          <mesh position={[-0.24, 0.08, 0.025]}>
            <boxGeometry args={[0.16, 0.13, 0.02]} />
            <AccentMaterial color="#fbbf24" style="metallic" />
          </mesh>
          {/* Wireless Waves Arc */}
          <mesh position={[0.25, 0.1, 0.025]}>
            <torusGeometry args={[0.08, 0.015, 16, 24, Math.PI / 2]} />
            <AccentMaterial color="#ffffff" style="neon" />
          </mesh>
        </group>
      );

    case 'gold_bars_stack':
      return (
        <group position={[0, 0, 0.25]}>
          {/* Bottom Bar 1 */}
          <mesh position={[-0.18, -0.06, 0]}>
            <boxGeometry args={[0.38, 0.7, 0.14]} />
            <IconMaterial color="#eab308" secondaryColor="#fef08a" style="metallic" />
          </mesh>
          {/* Bottom Bar 2 */}
          <mesh position={[0.18, -0.06, 0]}>
            <boxGeometry args={[0.38, 0.7, 0.14]} />
            <IconMaterial color="#eab308" secondaryColor="#fef08a" style="metallic" />
          </mesh>
          {/* Top Pyramid Bar */}
          <mesh position={[0, 0.08, 0.14]}>
            <boxGeometry args={[0.38, 0.7, 0.14]} />
            <IconMaterial color="#eab308" secondaryColor="#fef08a" style="metallic" />
          </mesh>
        </group>
      );

    case 'money_bag_cash':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Bag Body */}
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.38, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="clay" />
          </mesh>
          {/* Top Tied Neck */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.18, 0.12, 0.22, 16]} />
            <AccentMaterial color="#fef08a" style="clay" />
          </mesh>
          {/* Dollar Sign Emblem */}
          <mesh position={[0, -0.05, 0.32]}>
            <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
            <AccentMaterial color="#15803d" style="glossy" />
          </mesh>
        </group>
      );

    case 'coffee_cup_ad':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Cup Body */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.22, 0.75, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="clay" />
          </mesh>
          {/* Sleeve */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.29, 0.25, 0.35, 32]} />
            <AccentMaterial color="#d97706" style="clay" />
          </mesh>
          {/* Lid */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.08, 32]} />
            <AccentMaterial color="#ffffff" style="glossy" />
          </mesh>
        </group>
      );

    case 'soda_can_ad':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Can Cylinder */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.8, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
          {/* Top Rim */}
          <mesh position={[0, 0.41, 0]}>
            <torusGeometry args={[0.26, 0.025, 16, 32]} />
            <AccentMaterial color="#cbd5e1" style="metallic" />
          </mesh>
        </group>
      );

    case 'ai_sparkle_wand':
    case 'magic_wand':
      return (
        <group position={[0, 0, 0.4]} rotation={[0, 0, Math.PI / 4]}>
          {/* Wand Shaft */}
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.8, 16]} />
            <IconMaterial color="#1e1b4b" secondaryColor={color} style="metallic" />
          </mesh>
          {/* Star Tip */}
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.08, 5]} />
            <AccentMaterial color={color} style="neon" />
          </mesh>
        </group>
      );

    case 'rocket_launch':
    case 'rocket':
      return (
        <group position={[0, 0, 0.45]}>
          {/* Body */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.32, 0.85, 32]} />
            <IconMaterial color={secondaryColor} secondaryColor={color} style="glossy" />
          </mesh>
          {/* Nosecone */}
          <mesh position={[0, 0.55, 0]}>
            <coneGeometry args={[0.22, 0.4, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Booster Flame */}
          <mesh position={[0, -0.55, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.2, 0.45, 32]} />
            <AccentMaterial color="#f97316" style="neon" />
          </mesh>
        </group>
      );

    case 'idea_lightbulb':
    case 'bulb':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Glass Bulb Sphere */}
          <mesh position={[0, 0.18, 0]}>
            <sphereGeometry args={[0.35, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="neon" />
          </mesh>
          {/* Screw Base */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.16, 0.14, 0.28, 24]} />
            <AccentMaterial color="#94a3b8" style="metallic" />
          </mesh>
        </group>
      );

    case 'trophy_cup':
    case 'trophy':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Cup Bowl */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.35, 0.18, 0.45, 32]} />
            <IconMaterial color="#eab308" secondaryColor="#fef08a" style="metallic" />
          </mesh>
          {/* Pedestal Stem */}
          <mesh position={[0, -0.15, 0]}>
            <cylinderGeometry args={[0.08, 0.12, 0.28, 16]} />
            <AccentMaterial color="#eab308" style="metallic" />
          </mesh>
          {/* Heavy Base Block */}
          <mesh position={[0, -0.35, 0]}>
            <boxGeometry args={[0.45, 0.16, 0.45]} />
            <AccentMaterial color="#1e293b" style="matte" />
          </mesh>
        </group>
      );

    case 'gem':
    case 'diamond_gem':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Upper Crown */}
          <mesh position={[0, 0.08, 0]}>
            <cylinderGeometry args={[0.3, 0.45, 0.25, 8]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
          {/* Lower Pavilion Point */}
          <mesh position={[0, -0.2, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.45, 0.38, 8]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glass" />
          </mesh>
        </group>
      );

    case 'star':
      return (
        <group position={[0, 0, 0.35]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.45, 0.45, 0.12, 5]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="metallic" />
          </mesh>
        </group>
      );

    case 'heart':
    case 'social_heart_bubble':
      return (
        <group position={[0, 0, 0.35]}>
          {/* Left Heart Lobule */}
          <mesh position={[-0.16, 0.12, 0]}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Right Heart Lobule */}
          <mesh position={[0.16, 0.12, 0]}>
            <sphereGeometry args={[0.26, 32, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
          {/* Lower Pointed Cone */}
          <mesh position={[0, -0.16, 0]} rotation={[0, 0, Math.PI]}>
            <coneGeometry args={[0.38, 0.5, 32]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style="glossy" />
          </mesh>
        </group>
      );

    case 'bell':
      return (
        <group position={[0, 0, 0.4]}>
          {/* Bell Body */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.15, 0.38, 0.55, 32]} />
            <IconMaterial color="#f59e0b" secondaryColor="#fef08a" style="metallic" />
          </mesh>
          {/* Clapper Ball */}
          <mesh position={[0, -0.26, 0]}>
            <sphereGeometry args={[0.12, 24, 24]} />
            <AccentMaterial color="#d97706" style="metallic" />
          </mesh>
        </group>
      );

    default:
      // High-grade fallback 3D advertising prism with rounded corners and PBR material
      return (
        <group position={[0, 0, 0.35]}>
          <mesh>
            <boxGeometry args={[0.75, 0.75, 0.75]} />
            <IconMaterial color={color} secondaryColor={secondaryColor} style={style} />
          </mesh>
        </group>
      );
  }
}

export function Spline3DIconRenderer({ obj, isPreviewMode, onInteract }: { obj: SceneObject; isPreviewMode: boolean; onInteract?: (e: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const liveInteractionsInDesign = useEditorStore(state => state.liveInteractionsInDesign);
  const isInteractiveActive = isPreviewMode || liveInteractionsInDesign;
  
  const iconType = obj.properties?.iconType || 'sale_tag';
  const color = obj.properties?.color || '#ef4444';
  const secondaryColor = obj.properties?.secondaryColor || '#ffffff';
  const style = obj.properties?.materialStyle || 'glossy';
  const enableFloat = obj.properties?.floatAnim !== false;
  const rotationSpeed = obj.properties?.rotationSpeed ?? 0.4;

  const iconMetadata = useMemo(() => {
    return SPLINE_3D_ICONS.find(i => i.id === iconType);
  }, [iconType]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    if (isInteractiveActive) {
      const t = state.clock.getElapsedTime();
      if (enableFloat) {
        groupRef.current.position.z = Math.sin(t * 2) * 0.05;
      }
      if (rotationSpeed > 0) {
        // Rotate around Z axis (scene convention: Z-up)
        groupRef.current.rotation.z += delta * rotationSpeed;
      }
    } else {
      if (groupRef.current.position.z !== 0) {
        groupRef.current.position.z = 0;
      }
    }
  });

  const fallbackShape = (
    <ProceduralIconShape 
      iconType={iconType} 
      color={color} 
      secondaryColor={secondaryColor} 
      style={style} 
    />
  );

  const modelUrl = (obj.properties?.modelUrl as string) || iconMetadata?.modelUrl || '';

  return (
    <group ref={groupRef}>
      {modelUrl ? (
        <ModelErrorBoundary fallback={fallbackShape}>
          <React.Suspense fallback={fallbackShape}>
            <IconModel url={modelUrl} fallback={fallbackShape} />
          </React.Suspense>
        </ModelErrorBoundary>
      ) : (
        fallbackShape
      )}
    </group>
  );
}

class ModelErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any) {
    console.warn('3D Icon Model GLB load failed, seamlessly rendering high-res procedural 3D model:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function IconModel({ url, fallback }: { url: string; fallback: React.ReactNode }) {
  const { scene } = useGLTF(url);
  const normalized = React.useMemo(() => {
    if (!scene) return null;
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = maxDim > 0.001 ? 1.4 / maxDim : 1;
    clone.scale.setScalar(targetScale);

    const center = new THREE.Vector3();
    box.getCenter(center);
    // In Z-up coordinate system: bottom sits at z=0, center is (0,0)
    clone.position.set(-center.x * targetScale, -center.y * targetScale, -box.min.z * targetScale);
    return clone;
  }, [scene]);

  if (!normalized) return <>{fallback}</>;
  return <primitive object={normalized} />;
}
