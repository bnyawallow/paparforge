import React from 'react';
import * as LucideIcons from 'lucide-react';
import { SceneObject } from '../types';

export interface Spline2DIconMetadata {
  id: string;
  name: string;
  category: 'UI & Navigation' | 'Media & Audio' | 'Tech & Dev' | 'Commerce & Finance' | 'Social & Comm' | 'Status & Badges';
  iconName: keyof typeof LucideIcons;
  defaultColor: string;
  secondaryColor?: string;
  badgeStyle: 'glass' | 'clay' | 'neon' | 'flat' | 'gradient';
  description: string;
  tags: string[];
}

export const SPLINE_2D_ICONS: Spline2DIconMetadata[] = [
  // --- UI & NAVIGATION ---
  {
    id: '2d_home',
    name: 'Home Dashboard',
    category: 'UI & Navigation',
    iconName: 'Home',
    defaultColor: '#3b82f6',
    badgeStyle: 'glass',
    description: 'Minimalist home dashboard icon badge',
    tags: ['home', 'ui', 'dashboard', 'main']
  },
  {
    id: '2d_layers',
    name: 'Stack Layers',
    category: 'UI & Navigation',
    iconName: 'Layers',
    defaultColor: '#8b5cf6',
    badgeStyle: 'clay',
    description: '3D layered depth visual badge',
    tags: ['layers', 'stack', 'design', 'depth']
  },
  {
    id: '2d_settings',
    name: 'System Gear',
    category: 'UI & Navigation',
    iconName: 'Settings',
    defaultColor: '#64748b',
    badgeStyle: 'flat',
    description: 'Precision settings gear symbol',
    tags: ['settings', 'gear', 'config', 'admin']
  },
  {
    id: '2d_grid',
    name: 'Bento Grid',
    category: 'UI & Navigation',
    iconName: 'Grid',
    defaultColor: '#06b6d4',
    badgeStyle: 'glass',
    description: 'Bento layout grid icon',
    tags: ['grid', 'layout', 'bento', 'ui']
  },
  {
    id: '2d_compass',
    name: 'Navigation Compass',
    category: 'UI & Navigation',
    iconName: 'Compass',
    defaultColor: '#10b981',
    badgeStyle: 'gradient',
    description: 'Spatial 3D navigation compass emblem',
    tags: ['compass', 'navigate', 'map', 'explore']
  },
  {
    id: '2d_eye',
    name: 'Vision Eye',
    category: 'UI & Navigation',
    iconName: 'Eye',
    defaultColor: '#ec4899',
    badgeStyle: 'neon',
    description: 'Cyber optic vision eye icon',
    tags: ['eye', 'view', 'vision', 'observe']
  },

  // --- MEDIA & AUDIO ---
  {
    id: '2d_play',
    name: 'Play Stream',
    category: 'Media & Audio',
    iconName: 'Play',
    defaultColor: '#22c55e',
    badgeStyle: 'gradient',
    description: 'Vibrant play trigger button badge',
    tags: ['play', 'video', 'media', 'start']
  },
  {
    id: '2d_music',
    name: 'Music Note',
    category: 'Media & Audio',
    iconName: 'Music',
    defaultColor: '#ec4899',
    badgeStyle: 'neon',
    description: 'Audio rhythm track symbol',
    tags: ['music', 'audio', 'sound', 'song']
  },
  {
    id: '2d_mic',
    name: 'Studio Microphone',
    category: 'Media & Audio',
    iconName: 'Mic',
    defaultColor: '#f59e0b',
    badgeStyle: 'clay',
    description: 'Voice audio recording mic',
    tags: ['mic', 'audio', 'voice', 'record']
  },
  {
    id: '2d_camera',
    name: 'Capture Lens',
    category: 'Media & Audio',
    iconName: 'Camera',
    defaultColor: '#0ea5e9',
    badgeStyle: 'glass',
    description: 'AR camera viewport trigger',
    tags: ['camera', 'photo', 'capture', 'media']
  },
  {
    id: '2d_film',
    name: 'Cinema Reel',
    category: 'Media & Audio',
    iconName: 'Film',
    defaultColor: '#a855f7',
    badgeStyle: 'glass',
    description: 'Motion video film reel icon',
    tags: ['film', 'video', 'movie', 'cinema']
  },

  // --- TECH & DEV ---
  {
    id: '2d_code',
    name: 'Dev Script',
    category: 'Tech & Dev',
    iconName: 'Code',
    defaultColor: '#38bdf8',
    badgeStyle: 'neon',
    description: 'Developer code syntax emblem',
    tags: ['code', 'script', 'developer', 'syntax']
  },
  {
    id: '2d_terminal',
    name: 'CLI Terminal',
    category: 'Tech & Dev',
    iconName: 'Terminal',
    defaultColor: '#10b981',
    badgeStyle: 'neon',
    description: 'Command line interface terminal block',
    tags: ['terminal', 'cli', 'console', 'command']
  },
  {
    id: '2d_cpu',
    name: 'AI Processor',
    category: 'Tech & Dev',
    iconName: 'Cpu',
    defaultColor: '#8b5cf6',
    badgeStyle: 'gradient',
    description: 'Microchip CPU neural core',
    tags: ['cpu', 'ai', 'processor', 'chip']
  },
  {
    id: '2d_database',
    name: 'Cloud Database',
    category: 'Tech & Dev',
    iconName: 'Database',
    defaultColor: '#0ea5e9',
    badgeStyle: 'glass',
    description: 'Persistent data store cylinder badge',
    tags: ['database', 'data', 'cloud', 'sql']
  },
  {
    id: '2d_wifi',
    name: 'Wireless Signal',
    category: 'Tech & Dev',
    iconName: 'Wifi',
    defaultColor: '#22c55e',
    badgeStyle: 'glass',
    description: 'Live connectivity signal waves',
    tags: ['wifi', 'network', 'wireless', 'signal']
  },
  {
    id: '2d_shield',
    name: 'Security Guard',
    category: 'Tech & Dev',
    iconName: 'Shield',
    defaultColor: '#3b82f6',
    badgeStyle: 'clay',
    description: 'Encrypted security badge shield',
    tags: ['shield', 'security', 'protect', 'lock']
  },

  // --- COMMERCE & FINANCE ---
  {
    id: '2d_shopping_bag',
    name: 'Store Checkout',
    category: 'Commerce & Finance',
    iconName: 'ShoppingBag',
    defaultColor: '#f43f5e',
    badgeStyle: 'clay',
    description: 'E-commerce shopping bag symbol',
    tags: ['shop', 'cart', 'buy', 'ecommerce']
  },
  {
    id: '2d_credit_card',
    name: 'Digital Card',
    category: 'Commerce & Finance',
    iconName: 'CreditCard',
    defaultColor: '#6366f1',
    badgeStyle: 'glass',
    description: 'Seamless payment credit card badge',
    tags: ['card', 'pay', 'finance', 'money']
  },
  {
    id: '2d_wallet',
    name: 'Crypto Wallet',
    category: 'Commerce & Finance',
    iconName: 'Wallet',
    defaultColor: '#f59e0b',
    badgeStyle: 'gradient',
    description: 'Digital asset crypto wallet icon',
    tags: ['wallet', 'crypto', 'money', 'pay']
  },
  {
    id: '2d_award',
    name: 'Achievement Medal',
    category: 'Commerce & Finance',
    iconName: 'Award',
    defaultColor: '#eab308',
    badgeStyle: 'gradient',
    description: 'Gold tier achievement ribbon badge',
    tags: ['award', 'medal', 'trophy', 'badge']
  },
  {
    id: '2d_gift',
    name: 'Reward Gift',
    category: 'Commerce & Finance',
    iconName: 'Gift',
    defaultColor: '#ec4899',
    badgeStyle: 'clay',
    description: 'Surprise promo gift badge',
    tags: ['gift', 'reward', 'present', 'promo']
  },

  // --- SOCIAL & COMM ---
  {
    id: '2d_chat',
    name: 'Live Chat Bubble',
    category: 'Social & Comm',
    iconName: 'MessageSquare',
    defaultColor: '#3b82f6',
    badgeStyle: 'glass',
    description: 'Interactive live chat message bubble',
    tags: ['chat', 'message', 'comm', 'social']
  },
  {
    id: '2d_send',
    name: 'Paper Airplane',
    category: 'Social & Comm',
    iconName: 'Send',
    defaultColor: '#0ea5e9',
    badgeStyle: 'gradient',
    description: 'Instant message dispatch icon',
    tags: ['send', 'mail', 'airplane', 'dispatch']
  },
  {
    id: '2d_bell',
    name: 'Notify Bell',
    category: 'Social & Comm',
    iconName: 'Bell',
    defaultColor: '#f59e0b',
    badgeStyle: 'clay',
    description: 'Realtime alert notification bell',
    tags: ['bell', 'notify', 'alert', 'social']
  },
  {
    id: '2d_heart',
    name: 'Like Heart',
    category: 'Social & Comm',
    iconName: 'Heart',
    defaultColor: '#ef4444',
    badgeStyle: 'neon',
    description: 'Vibrant love heart favorite emblem',
    tags: ['heart', 'love', 'like', 'favorite']
  },
  {
    id: '2d_users',
    name: 'Community Group',
    category: 'Social & Comm',
    iconName: 'Users',
    defaultColor: '#a855f7',
    badgeStyle: 'glass',
    description: 'Multi-user community avatars',
    tags: ['users', 'team', 'group', 'social']
  },

  // --- STATUS & BADGES ---
  {
    id: '2d_sparkles',
    name: 'Magic Sparkles',
    category: 'Status & Badges',
    iconName: 'Sparkles',
    defaultColor: '#ec4899',
    badgeStyle: 'neon',
    description: 'AI generation sparkles emblem',
    tags: ['sparkles', 'ai', 'magic', 'star']
  },
  {
    id: '2d_zap',
    name: 'Lightning Energy',
    category: 'Status & Badges',
    iconName: 'Zap',
    defaultColor: '#eab308',
    badgeStyle: 'neon',
    description: 'Instant turbo speed energy bolt',
    tags: ['zap', 'energy', 'power', 'fast']
  },
  {
    id: '2d_flame',
    name: 'Hot Streak Flame',
    category: 'Status & Badges',
    iconName: 'Flame',
    defaultColor: '#f97316',
    badgeStyle: 'gradient',
    description: 'Trending hot streak fire badge',
    tags: ['flame', 'fire', 'hot', 'streak']
  },
  {
    id: '2d_check_circle',
    name: 'Verified Check',
    category: 'Status & Badges',
    iconName: 'CheckCircle',
    defaultColor: '#22c55e',
    badgeStyle: 'clay',
    description: 'Official verified status checkmark',
    tags: ['check', 'verified', 'done', 'success']
  },
  {
    id: '2d_star',
    name: 'Rating Star',
    category: 'Status & Badges',
    iconName: 'Star',
    defaultColor: '#f59e0b',
    badgeStyle: 'gradient',
    description: '5-star quality rating symbol',
    tags: ['star', 'rating', 'favorite', 'quality']
  },
  {
    id: '2d_shield',
    name: 'Security Shield',
    category: 'Status & Badges',
    iconName: 'Shield',
    defaultColor: '#3b82f6',
    badgeStyle: 'glass',
    description: 'Encrypted security protection emblem',
    tags: ['shield', 'security', 'protect', 'lock']
  },
  {
    id: '2d_box',
    name: '3D Package Box',
    category: 'Tech & Dev',
    iconName: 'Box',
    defaultColor: '#a855f7',
    badgeStyle: 'clay',
    description: '3D spatial asset container box',
    tags: ['box', 'package', 'container', '3d']
  },
  {
    id: '2d_globe',
    name: 'Global Network',
    category: 'Tech & Dev',
    iconName: 'Globe',
    defaultColor: '#0ea5e9',
    badgeStyle: 'glass',
    description: 'Worldwide spatial network globe',
    tags: ['globe', 'world', 'network', 'web']
  },
  {
    id: '2d_wifi',
    name: 'Wireless Signal',
    category: 'Tech & Dev',
    iconName: 'Wifi',
    defaultColor: '#10b981',
    badgeStyle: 'neon',
    description: 'High-speed wireless signal gauge',
    tags: ['wifi', 'network', 'connect', 'signal']
  },
  {
    id: '2d_cpu',
    name: 'Processor Chip',
    category: 'Tech & Dev',
    iconName: 'Cpu',
    defaultColor: '#ef4444',
    badgeStyle: 'flat',
    description: 'Core silicon CPU processor unit',
    tags: ['cpu', 'chip', 'tech', 'hardware']
  },
  {
    id: '2d_database',
    name: 'Data Storage',
    category: 'Tech & Dev',
    iconName: 'Database',
    defaultColor: '#6366f1',
    badgeStyle: 'clay',
    description: 'Cloud database storage cylinder',
    tags: ['database', 'data', 'cloud', 'storage']
  },
  {
    id: '2d_terminal',
    name: 'CLI Terminal',
    category: 'Tech & Dev',
    iconName: 'Terminal',
    defaultColor: '#22c55e',
    badgeStyle: 'neon',
    description: 'Developer command prompt console',
    tags: ['terminal', 'code', 'cli', 'dev']
  },
  {
    id: '2d_tag',
    name: 'Price Tag',
    category: 'Commerce & Finance',
    iconName: 'Tag',
    defaultColor: '#ec4899',
    badgeStyle: 'flat',
    description: 'Discount promotional price tag',
    tags: ['tag', 'price', 'discount', 'sale']
  },
  {
    id: '2d_percent',
    name: 'Discount Percent',
    category: 'Commerce & Finance',
    iconName: 'Percent',
    defaultColor: '#f97316',
    badgeStyle: 'gradient',
    description: 'Percentage off special offer badge',
    tags: ['percent', 'discount', 'offer', 'sale']
  },
  {
    id: '2d_camera',
    name: 'AR Lens Camera',
    category: 'Media & Audio',
    iconName: 'Camera',
    defaultColor: '#38bdf8',
    badgeStyle: 'glass',
    description: 'Live spatial AR photo lens',
    tags: ['camera', 'photo', 'ar', 'lens']
  },
  {
    id: '2d_mic',
    name: 'Voice Studio Mic',
    category: 'Media & Audio',
    iconName: 'Mic',
    defaultColor: '#a855f7',
    badgeStyle: 'neon',
    description: 'Studio broadcast microphone',
    tags: ['mic', 'voice', 'audio', 'podcast']
  },
  {
    id: '2d_sun',
    name: 'Daylight Sun',
    category: 'UI & Navigation',
    iconName: 'Sun',
    defaultColor: '#eab308',
    badgeStyle: 'gradient',
    description: 'High brightness solar lighting icon',
    tags: ['sun', 'day', 'light', 'theme']
  },
  {
    id: '2d_moon',
    name: 'Night Mode Moon',
    category: 'UI & Navigation',
    iconName: 'Moon',
    defaultColor: '#818cf8',
    badgeStyle: 'glass',
    description: 'Dark mode night atmosphere icon',
    tags: ['moon', 'night', 'dark', 'theme']
  },
  {
    id: '2d_clock',
    name: 'Chronometer Clock',
    category: 'Status & Badges',
    iconName: 'Clock',
    defaultColor: '#64748b',
    badgeStyle: 'clay',
    description: 'Time elapsed chronometer badge',
    tags: ['clock', 'time', 'chrono', 'timer']
  },
  {
    id: '2d_trophy',
    name: 'Gold Trophy',
    category: 'Status & Badges',
    iconName: 'Trophy',
    defaultColor: '#eab308',
    badgeStyle: 'gradient',
    description: 'Winner achievement gold trophy',
    tags: ['trophy', 'winner', 'gold', 'award']
  },
  {
    id: '2d_share',
    name: 'Export Share',
    category: 'Social & Comm',
    iconName: 'Share2',
    defaultColor: '#0ea5e9',
    badgeStyle: 'glass',
    description: 'Instant social link export icon',
    tags: ['share', 'export', 'link', 'social']
  },
  {
    id: '2d_download',
    name: 'Download File',
    category: 'Tech & Dev',
    iconName: 'Download',
    defaultColor: '#22c55e',
    badgeStyle: 'clay',
    description: 'Local asset download save trigger',
    tags: ['download', 'save', 'file', 'export']
  }
];
