import React, { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'dark' | 'light' | 'primary' | 'accent';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  childrenClassName?: string;
}

export function GlassCard({ className, childrenClassName, variant = 'default', blur = 'md', children, ...props }: GlassCardProps) {
  const baseClasses = "relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300";
  
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
  };

  const variantClasses = {
    default: "bg-white/10 border-white/20 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
    dark: "bg-black/40 border-white/10 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]",
    light: "bg-white/40 border-white/40 text-gray-900 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]",
    primary: "bg-blue-600/20 border-blue-400/30 text-blue-50 shadow-[0_8px_32px_0_rgba(37,99,235,0.2)]",
    accent: "bg-emerald-500/20 border-emerald-400/30 text-emerald-50 shadow-[0_8px_32px_0_rgba(16,185,129,0.2)]",
  };

  const hasFlex = className?.includes('flex') || className?.includes('inline-flex');

  return (
    <div className={cn(baseClasses, blurClasses[blur], variantClasses[variant], className)} {...props}>
      {/* Subtle top inner shadow/highlight effect typical of glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-2xl"></div>
      <div className={cn("relative z-10", hasFlex && "flex items-center gap-2", childrenClassName)}>{children}</div>
    </div>
  );
}

export interface GlassPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode;
  icon?: ReactNode;
}

export function GlassPanel({ className, title, icon, children, ...props }: GlassPanelProps) {
  return (
    <GlassCard variant="dark" className={cn("p-4 border-t-white/20 border-l-white/20", className)} {...props}>
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          {icon && <div className="text-cyan-400">{icon}</div>}
          {title && <h3 className="font-bold text-sm tracking-widest uppercase text-white/90">{title}</h3>}
        </div>
      )}
      <div className="text-sm text-white/80 leading-relaxed">
        {children}
      </div>
    </GlassCard>
  );
}

export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  maxWidth?: string;
  hideHeader?: boolean;
}

export function GlassModal({ isOpen, onClose, title, children, className, maxWidth = "max-w-lg", hideHeader = false }: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn("pointer-events-auto w-full", maxWidth)}
            >
              <GlassCard variant="dark" className={cn("overflow-hidden border-t-white/20", className)}>
                {!hideHeader && (
                  <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
                    <h3 className="font-bold text-lg text-white/90">{title}</h3>
                    <button 
                      onClick={onClose}
                      className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                )}
                <div className={hideHeader ? "" : "p-6"}>
                  {children}
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export function GlassFAB({ icon, variant = 'default', size = 'md', className, ...props }: FloatingActionButtonProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-16 h-16",
  };

  const variantClasses = {
    default: "bg-white/10 border-white/20 text-white hover:bg-white/20",
    primary: "bg-blue-600/30 border-blue-400/40 text-blue-50 hover:bg-blue-600/50",
    danger: "bg-red-600/30 border-red-400/40 text-red-50 hover:bg-red-600/50",
    success: "bg-emerald-600/30 border-emerald-400/40 text-emerald-50 hover:bg-emerald-600/50",
  };

  return (
    <button
      className={cn(
        "rounded-full flex items-center justify-center border shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

export interface GlassBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'danger';
}

export function GlassBadge({ variant = 'default', className, children, ...props }: GlassBadgeProps) {
  const variantClasses = {
    default: "bg-white/10 border-white/20 text-white/90",
    info: "bg-blue-500/20 border-blue-400/30 text-blue-300",
    success: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
    warning: "bg-amber-500/20 border-amber-400/30 text-amber-300",
    danger: "bg-red-500/20 border-red-400/30 text-red-300",
  };

  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border backdrop-blur-sm",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export interface GlassTooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function GlassTooltip({ content, children, position = 'top', className }: GlassTooltipProps) {
  // A simple CSS-based hover tooltip
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="group relative inline-block">
      {children}
      <div 
        className={cn(
          "absolute hidden group-hover:block z-50 w-max max-w-xs",
          positionClasses[position],
          className
        )}
      >
        <div className="bg-black/60 border border-white/10 backdrop-blur-md text-white text-xs py-1.5 px-3 rounded-lg shadow-xl">
          {content}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* EXPANDED NEW HUD COLLECTION COMPONENTS                                      */
/* ========================================================================== */

export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'cyan' | 'primary' | 'emerald' | 'amber' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export function GlassButton({
  children,
  variant = 'cyan',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  disabled,
  ...props
}: GlassButtonProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
    md: 'px-4 py-2 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
  };

  const variantClasses = {
    default: 'bg-white/10 hover:bg-white/20 border-white/20 text-white shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.15)]',
    cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/40 text-cyan-200 shadow-[0_4px_20px_rgba(6,182,212,0.2)] hover:shadow-[0_4px_25px_rgba(6,182,212,0.4)]',
    primary: 'bg-blue-600/20 hover:bg-blue-600/35 border-blue-400/40 text-blue-100 shadow-[0_4px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.4)]',
    emerald: 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/40 text-emerald-200 shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_4px_25px_rgba(16,185,129,0.4)]',
    amber: 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/40 text-amber-200 shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)]',
    danger: 'bg-red-500/20 hover:bg-red-500/30 border-red-400/40 text-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.4)]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'relative inline-flex items-center justify-center font-medium border backdrop-blur-md transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none overflow-hidden group',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {/* Top highlight glare effect */}
      <span className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
      )}

      {children && <span className="relative z-10 tracking-wide font-mono uppercase text-xs">{children}</span>}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className="shrink-0 group-hover:scale-110 transition-transform">{icon}</span>
      )}
    </button>
  );
}

export interface GlassProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  max?: number;
  label?: ReactNode;
  showPercentage?: boolean;
  color?: 'cyan' | 'emerald' | 'blue' | 'amber' | 'purple' | 'rose';
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function GlassProgress({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'cyan',
  height = 'md',
  animated = true,
  className,
  ...props
}: GlassProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    cyan: 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.8)]',
    emerald: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]',
    blue: 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)]',
    amber: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]',
    purple: 'bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)]',
    rose: 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)} {...props}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-mono tracking-wider text-white/80">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-bold text-cyan-300">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-black/40 border border-white/10 rounded-full overflow-hidden backdrop-blur-md p-0.5 relative', heightClasses[height])}>
        <motion.div
          className={cn('h-full rounded-full transition-all duration-300 relative', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {animated && (
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:16px_16px] animate-[stripe_1s_linear_infinite]" />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

export function GlassInput({ label, icon, error, className, id, ...props }: GlassInputProps) {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={id} className="block text-xs font-mono uppercase tracking-wider text-white/70">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && <div className="absolute left-3 text-cyan-400 pointer-events-none z-10">{icon}</div>}
        <input
          id={id}
          className={cn(
            'w-full bg-black/30 border border-white/15 rounded-xl text-sm text-white placeholder-white/30 backdrop-blur-md py-2.5 transition-all duration-200 outline-none focus:border-cyan-400/80 focus:bg-black/50 focus:ring-2 focus:ring-cyan-500/20',
            icon ? 'pl-10 pr-4' : 'px-4',
            error ? 'border-red-500/80 focus:border-red-500' : '',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-[11px] text-red-400 font-mono mt-1">{error}</p>}
    </div>
  );
}

export interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function GlassToggle({ checked, onChange, label, disabled = false, className }: GlassToggleProps) {
  return (
    <label className={cn('inline-flex items-center gap-3 cursor-pointer select-none', disabled && 'opacity-50 cursor-not-allowed', className)}>
      <div
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative w-11 h-6 rounded-full border border-white/20 backdrop-blur-md transition-colors duration-300 p-0.5',
          checked ? 'bg-cyan-500/30 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-black/40 border-white/10'
        )}
      >
        <motion.div
          className={cn('w-4 h-4 rounded-full shadow-md transition-colors', checked ? 'bg-cyan-300 shadow-[0_0_8px_#22d3ee]' : 'bg-white/60')}
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
      {label && <span className="text-xs font-mono uppercase tracking-wider text-white/80">{label}</span>}
    </label>
  );
}

export interface GlassStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string | number; positive?: boolean };
  icon?: ReactNode;
  progress?: number; // 0..100
  className?: string;
}

export function GlassStatCard({ title, value, subtitle, trend, icon, progress, className }: GlassStatCardProps) {
  return (
    <GlassCard variant="dark" className={cn('p-4 space-y-3 border-t-white/20', className)}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-widest text-white/60">{title}</span>
        {icon && <div className="p-2 bg-white/5 rounded-lg text-cyan-400 border border-white/10">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold font-mono tracking-tight text-white">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-mono px-2 py-0.5 rounded-full border backdrop-blur-sm',
              trend.positive
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300'
                : 'bg-red-500/20 border-red-400/30 text-red-300'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="text-[11px] text-white/50">{subtitle}</p>}

      {progress !== undefined && <GlassProgress value={progress} showPercentage={false} height="sm" color="cyan" />}
    </GlassCard>
  );
}

export interface GlassTabsProps<T extends string> {
  tabs: Array<{ id: T; label: string; icon?: ReactNode }>;
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

export function GlassTabs<T extends string>({ tabs, activeTab, onChange, className }: GlassTabsProps<T>) {
  return (
    <div className={cn('inline-flex p-1 bg-black/40 border border-white/15 rounded-2xl backdrop-blur-md gap-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-4 py-1.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-200 flex items-center gap-2 select-none',
              isActive ? 'text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabGlow"
                className="absolute inset-0 bg-cyan-500/25 border border-cyan-400/50 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)] pointer-events-none"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            {tab.icon && <span className="relative z-10 text-cyan-400">{tab.icon}</span>}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface GlassReticleProps {
  statusText?: string;
  active?: boolean;
  size?: number;
  className?: string;
}

export function GlassReticle({ statusText = 'TARGET LOCKED', active = true, size = 120, className }: GlassReticleProps) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center select-none pointer-events-none', className)}>
      <div
        className="relative flex items-center justify-center border border-cyan-400/30 rounded-full backdrop-blur-sm bg-cyan-500/5 animate-[pulse_3s_infinite]"
        style={{ width: size, height: size }}
      >
        {/* Corner notch crosshairs */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

        {/* Inner rotating ring */}
        <div className="w-2/3 h-2/3 border border-dashed border-cyan-300/60 rounded-full animate-[spin_10s_linear_infinite]" />

        {/* Center reticle dot */}
        <div className={cn('w-2.5 h-2.5 rounded-full transition-all', active ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]')} />
      </div>

      {statusText && (
        <div className="mt-2 px-2.5 py-0.5 bg-black/60 border border-cyan-400/30 rounded-full text-[10px] font-mono text-cyan-300 tracking-widest uppercase backdrop-blur-md shadow-lg">
          {statusText}
        </div>
      )}
    </div>
  );
}

