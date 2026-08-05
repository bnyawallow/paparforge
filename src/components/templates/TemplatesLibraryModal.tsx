import React, { useState } from 'react';
import { useEditorStore, generateTemplate } from '../../store/useEditorStore';
import { TemplateType } from '../../types';
import { 
  X, LayoutTemplate, Sparkles, Check, ArrowRight, ShieldAlert,
  Car, Coffee, Gem, Building2, BookOpen, CreditCard, ShoppingBag, Eye, Zap, Layers, RefreshCw
} from 'lucide-react';
import { GlassModal } from '../ui/HudComponents';

interface TemplatesLibraryModalProps {
  onClose: () => void;
}

interface TemplateCardData {
  id: TemplateType;
  title: string;
  category: 'product' | 'auto' | 'food' | 'luxury' | 'realestate' | 'business' | 'education' | 'poster';
  categoryLabel: string;
  badge: string;
  description: string;
  printTargetScenario: string;
  features: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  bgGradient: string;
}

const TEMPLATE_SCAFFOLDS: TemplateCardData[] = [
  {
    id: 'product_showcase',
    title: 'Magazine Product Showcase',
    category: 'product',
    categoryLabel: 'Product & Retail',
    badge: 'Popular Print Ad',
    description: 'Interactive 3D product model with spin controls, live color swatches, buy button CTA, video demo, and audio review.',
    printTargetScenario: 'Magazine Ads, Product Boxes & Catalogs',
    features: ['3D Mesh & Material Swatches', 'Interactive Buy Button CTA', 'Audio & Video Stream Support', 'Entrance HUD Animations'],
    icon: ShoppingBag,
    accentColor: '#3B82F6',
    bgGradient: 'from-blue-900/40 via-blue-950/20 to-transparent'
  },
  {
    id: 'automobile_showroom',
    title: 'Automobile Showroom Print Ad',
    category: 'auto',
    categoryLabel: 'Automotive & Industrial',
    badge: '3D Color Switcher',
    description: '3D car chassis model with interactive color switcher, key specs readout, test drive booking button, and V8 engine audio.',
    printTargetScenario: 'Newspaper Ads, Car Catalogues & Billboards',
    features: ['Real-time Paint Swatches', 'Specs HUD Overlay', 'Engine Sound Effect Node', 'Test Drive Callout'],
    icon: Car,
    accentColor: '#F97316',
    bgGradient: 'from-amber-900/40 via-orange-950/20 to-transparent'
  },
  {
    id: 'fast_food_beverage',
    title: 'Food & Beverage Promo Inserts',
    category: 'food',
    categoryLabel: 'Food & Dining',
    badge: 'High Conversion',
    description: 'Dynamic beverage can & gourmet combo box with floating flavor rings, promo coupon code pill, and delivery order CTA.',
    printTargetScenario: 'Menu Inserts, Table Tent Cards & Food Packaging',
    features: ['Floating Behavior FX', 'Promo Code Voucher Pill', 'Instant Delivery Order CTA', 'Spinning Asset Anchors'],
    icon: Coffee,
    accentColor: '#EAB308',
    bgGradient: 'from-yellow-900/40 via-amber-950/20 to-transparent'
  },
  {
    id: 'luxury_fashion',
    title: 'Luxury Fashion & Jewelry',
    category: 'luxury',
    categoryLabel: 'Luxury & Fashion',
    badge: 'PBR Physical Shader',
    description: 'Gold ring & perfume bottle on marble pedestal with dynamic PBR clearcoat materials, try-on callout, and luxury shop button.',
    printTargetScenario: 'Luxury Magazines, Store Display Posters',
    features: ['Reflective PBR Materials', 'Floating Sparkle FX', 'VIP Collection Button', 'Ambient Audio Node'],
    icon: Gem,
    accentColor: '#EC4899',
    bgGradient: 'from-pink-900/40 via-rose-950/20 to-transparent'
  },
  {
    id: 'real_estate',
    title: 'Real Estate Brochure AR',
    category: 'realestate',
    categoryLabel: 'Real Estate & Architecture',
    badge: 'Interactive Floorplan',
    description: '3D villa architectural model with floor selector buttons, virtual tour trigger button, and direct agent call action.',
    printTargetScenario: 'Property Brochures, Yard Signs & Inserts',
    features: ['Architectural 3D Model', 'Floor Selector Buttons', 'Virtual Tour Video Player', 'Agent Contact Action'],
    icon: Building2,
    accentColor: '#10B981',
    bgGradient: 'from-emerald-900/40 via-teal-950/20 to-transparent'
  },
  {
    id: 'business_card',
    title: 'Business Card WebAR',
    category: 'business',
    categoryLabel: 'Business & Professional',
    badge: 'Essential AR Card',
    description: '3D logo badge, quick tap social media icons, profile card, audio greeting, and direct vCard saved contact button.',
    printTargetScenario: 'Business Cards, Badges & Conference Passes',
    features: ['Interactive Social Icons', 'vCard Contact Trigger', '3D Emblem Ring', 'Audio Chime Greeting'],
    icon: CreditCard,
    accentColor: '#8B5CF6',
    bgGradient: 'from-purple-900/40 via-indigo-950/20 to-transparent'
  },
  {
    id: 'educational',
    title: 'Educational Book Interactive AR',
    category: 'education',
    categoryLabel: 'Education & STEM',
    badge: 'STEM Audio Narrator',
    description: '3D solar system planet model with orbit animation, facts info panel, voice narration sound node, and STEM quiz button.',
    printTargetScenario: 'School Textbooks, Flashcards & Science Posters',
    features: ['Orbital Physics Motion', 'Voice Narration Player', 'Fact Spot annotation', 'Interactive STEM Quiz'],
    icon: BookOpen,
    accentColor: '#06B6D4',
    bgGradient: 'from-cyan-900/40 via-sky-950/20 to-transparent'
  },
  {
    id: 'billboard_poster',
    title: 'Billboard Scannable AR Ad',
    category: 'poster',
    categoryLabel: 'Outdoor & Events',
    badge: 'Large Scale Target',
    description: 'Floating 3D mascot cube, glowing offer headline, event countdown panel, sound effect, and ticket booking CTA.',
    printTargetScenario: 'City Billboards, Event Posters & Bus Shelters',
    features: ['High-contrast Typography', 'Event Countdown Box', 'Sound FX Action', 'Ticket Booking CTA'],
    icon: Zap,
    accentColor: '#F43F5E',
    bgGradient: 'from-rose-900/40 via-red-950/20 to-transparent'
  }
];

export function TemplatesLibraryModal({ onClose }: TemplatesLibraryModalProps) {
  const { objects, addToast } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTemplate, setActiveTemplate] = useState<TemplateCardData>(TEMPLATE_SCAFFOLDS[0]);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

  const objectCount = Object.keys(objects).length;

  const filteredTemplates = TEMPLATE_SCAFFOLDS.filter(t => 
    selectedCategory === 'all' || t.category === selectedCategory
  );

  const handleApplyTemplate = (template: TemplateCardData) => {
    if (objectCount > 1) {
      setActiveTemplate(template);
      setConfirmReplaceOpen(true);
    } else {
      doApplyTemplate(template.id);
    }
  };

  const doApplyTemplate = (type: TemplateType) => {
    try {
      generateTemplate('AR Experience', type);
      addToast(`Scaffold template applied: ${activeTemplate.title}`);
      setConfirmReplaceOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to apply template:', err);
      addToast('Error applying template scaffold');
    }
  };

  return (
    <GlassModal 
      isOpen={true} 
      onClose={onClose} 
      hideHeader={true} 
      maxWidth="max-w-5xl" 
      className="flex flex-col h-[85vh] max-h-[750px] p-0 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#222] bg-[#0E0E0E]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <LayoutTemplate size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center gap-2">
              Print Ad AR Templates Library
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-900/40 border border-blue-700/50 px-2 py-0.5 rounded-full">
                {TEMPLATE_SCAFFOLDS.length} Ready Scaffolds
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Select a pre-built WebAR layout scaffold engineered specifically for print campaigns
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 hover:bg-[#222] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden bg-[#121212]">
        
        {/* Left Column: Category Filters + Scaffolds List */}
        <div className="w-7/12 border-r border-[#222] flex flex-col overflow-hidden">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 p-3 overflow-x-auto border-b border-[#1C1C1C] bg-[#0A0A0A] shrink-0 no-scrollbar">
            {[
              { id: 'all', label: 'All Scaffolds' },
              { id: 'product', label: 'Product & Retail' },
              { id: 'auto', label: 'Automotive' },
              { id: 'food', label: 'Food & Dining' },
              { id: 'luxury', label: 'Luxury Fashion' },
              { id: 'realestate', label: 'Real Estate' },
              { id: 'business', label: 'Business Cards' },
              { id: 'education', label: 'STEM Education' },
              { id: 'poster', label: 'Outdoor Posters' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'bg-[#181818] text-gray-400 hover:text-white hover:bg-[#222] border border-[#252525]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredTemplates.map((template) => {
              const IconComp = template.icon;
              const isSelected = activeTemplate.id === template.id;

              return (
                <div
                  key={template.id}
                  onClick={() => setActiveTemplate(template)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-[#1A1A1A] border-blue-500 shadow-md ring-1 ring-blue-500/30'
                      : 'bg-[#151515] border-[#222] hover:border-[#333] hover:bg-[#181818]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-inner"
                      style={{ backgroundColor: `${template.accentColor}20`, color: template.accentColor }}
                    >
                      <IconComp size={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono uppercase font-bold text-gray-400 tracking-wider">
                          {template.categoryLabel}
                        </span>
                        <span 
                          className="text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold"
                          style={{ 
                            backgroundColor: `${template.accentColor}15`, 
                            borderColor: `${template.accentColor}40`,
                            color: template.accentColor 
                          }}
                        >
                          {template.badge}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-white mt-1 group-hover:text-blue-400 transition-colors truncate">
                        {template.title}
                      </h3>

                      <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {template.description}
                      </p>

                      <div className="mt-2.5 flex items-center gap-2 text-[9px] font-mono text-gray-500">
                        <span className="text-gray-400 font-semibold">Print Target:</span>
                        <span className="truncate text-gray-300">{template.printTargetScenario}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Template Detail & Action Preview */}
        <div className="w-5/12 p-6 flex flex-col justify-between overflow-y-auto bg-[#0F0F0F]">
          <div className="space-y-5">
            
            {/* Template Header Preview */}
            <div className={`p-5 rounded-2xl border border-[#262626] bg-gradient-to-br ${activeTemplate.bgGradient} relative overflow-hidden space-y-3`}>
              <div className="flex items-center justify-between">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 shadow-xl"
                  style={{ backgroundColor: `${activeTemplate.accentColor}30`, color: activeTemplate.accentColor }}
                >
                  <activeTemplate.icon size={26} />
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/60 text-white border border-white/10 font-bold uppercase tracking-wider">
                  {activeTemplate.categoryLabel}
                </span>
              </div>

              <div>
                <h3 className="text-base font-extrabold text-white">{activeTemplate.title}</h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {activeTemplate.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-gray-300">
                <span>Target: {activeTemplate.printTargetScenario}</span>
              </div>
            </div>

            {/* Included Scaffolding Features */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={12} className="text-blue-400" /> Pre-Configured Scaffolding Components
              </span>

              <div className="space-y-1.5">
                {activeTemplate.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 rounded-lg bg-[#161616] border border-[#222]">
                    <div className="w-4 h-4 rounded-full bg-blue-950 border border-blue-800 flex items-center justify-center text-[9px] text-blue-400 shrink-0">
                      ✓
                    </div>
                    <span className="text-xs text-gray-200 font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Print Target Setup Box */}
            <div className="p-3.5 bg-[#141414] border border-[#222] rounded-xl space-y-1.5">
              <span className="text-[9px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                <Layers size={11} /> Print Campaign Readiness
              </span>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Applying this scaffold configures ready-to-use 3D models, image tracking anchors, 2D HUD UI panels, and event triggers.
              </p>
            </div>

          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-[#222] mt-4">
            <button
              onClick={() => handleApplyTemplate(activeTemplate)}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-98"
              style={{ backgroundColor: activeTemplate.accentColor }}
            >
              Apply Scaffold to Scene <ArrowRight size={14} />
            </button>
          </div>

        </div>

      </div>

      {/* Confirmation Modal overlay if scene already has objects */}
      {confirmReplaceOpen && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-[#181818] border border-[#333] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <ShieldAlert size={24} />
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-white">Replace Current Scene?</h4>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Your scene currently contains <strong className="text-white">{objectCount} objects</strong>. Applying the <strong className="text-blue-400">{activeTemplate.title}</strong> scaffold will replace the current objects with the scaffold entities.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmReplaceOpen(false)}
                className="flex-1 py-2 px-3 rounded-lg border border-[#333] bg-[#222] hover:bg-[#2A2A2A] text-xs font-bold font-mono text-gray-300 uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => doApplyTemplate(activeTemplate.id)}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold font-mono text-white uppercase tracking-wider transition-colors shadow-md cursor-pointer"
              >
                Confirm & Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </GlassModal>
  );
}
