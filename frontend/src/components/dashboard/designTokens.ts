/**
 * DASHBOARD DESIGN TOKENS
 * Exact values extracted from Superdesign export (Tailwind → CSS)
 * 
 * Light theme only, no gradients, no overlays
 * All values are px/hex/exact strings
 */

export const DASHBOARD_TOKENS = {
  // =============================================
  // 🎨 COLORS
  // =============================================
  
  // Page & surfaces
  pageBg: '#f8fafc',              // slate-50 (flat, no gradient)
  welcomeBg: '#eff6ff',           // blue-50 (flat, no gradient)
  cardBg: '#ffffff',              // white
  headerBg: 'rgba(255,255,255,0.9)', // white/90
  
  // Borders
  borderLight: '#dbeafe',         // blue-100
  borderLightAlpha: 'rgba(219,234,254,0.5)', // blue-100/50
  borderHover: '#60a5fa',         // blue-400
  
  // Icon box
  iconBoxBg: '#dbeafe',           // blue-100
  iconBoxBgHover: '#bfdbfe',      // blue-200
  iconColor: '#2563eb',           // blue-600
  
  // Text colors
  textTitle: '#1e293b',           // slate-800
  textBody: '#64748b',            // slate-500
  textMuted: '#94a3b8',           // slate-400
  textDivider: '#cbd5e1',         // slate-300
  textAccent: '#2563eb',          // blue-600
  
  // Badge
  badgeBg: '#3b82f6',             // blue-500
  badgeText: '#ffffff',
  
  // =============================================
  // 📐 SIZES & SPACING (exact px)
  // =============================================
  
  // Container
  containerMaxW: '768px',         // max-w-3xl = 48rem
  
  // Page padding
  paddingPageX: '16px',           // px-4
  paddingPageY: '32px',           // py-8
  paddingPageYMd: '48px',         // md:py-12
  
  // Gaps
  gapMain: '32px',                // gap-8
  gapMainMd: '40px',              // md:gap-10
  gapGrid: '16px',                // gap-4
  gapGridMd: '20px',              // md:gap-5
  gapHeader: '12px',              // gap-3
  gapHeaderControls: '20px',      // gap-5
  gapFooterLinks: '24px',         // gap-6
  
  // Header
  headerPaddingX: '24px',         // px-6
  headerPaddingY: '16px',         // py-4
  
  // Welcome block
  welcomeMaxW: '768px',           // max-w-3xl
  welcomePaddingX: '32px',        // px-8
  welcomePaddingY: '40px',        // py-10
  welcomeRadius: '16px',          // rounded-2xl
  
  // Card
  cardHeight: '180px',            // h-[180px]
  cardPadding: '20px',            // p-5
  cardRadius: '12px',             // rounded-xl
  
  // Icon box
  iconBoxSize: '40px',            // w-10 h-10
  iconBoxRadius: '8px',           // rounded-lg
  iconSize: '24px',               // w-6 h-6
  
  // Footer
  footerPaddingY: '24px',         // py-6
  
  // =============================================
  // 🌫️ SHADOWS (exact box-shadow strings)
  // =============================================
  
  // Welcome shadow: shadow-lg shadow-blue-100/50
  shadowWelcome: '0 10px 15px -3px rgba(219,234,254,0.5), 0 4px 6px -4px rgba(219,234,254,0.5)',
  
  // Card shadow: shadow-md shadow-blue-50
  shadowCard: '0 4px 6px -1px rgba(239,246,255,1), 0 2px 4px -2px rgba(239,246,255,1)',
  
  // Card hover shadow: shadow-lg shadow-blue-100
  shadowCardHover: '0 10px 15px -3px rgba(219,234,254,1), 0 4px 6px -4px rgba(219,234,254,1)',
  
  // =============================================
  // 📝 TYPOGRAPHY (exact values)
  // =============================================
  
  // Font sizes
  fontXs: '12px',                 // text-xs
  fontSm: '14px',                 // text-sm
  fontBase: '16px',               // text-base
  fontLg: '18px',                 // text-lg
  fontXl: '20px',                 // text-xl
  font2xl: '24px',                // text-2xl
  font3xl: '30px',                // text-3xl
  font4xl: '36px',                // text-4xl
  
  // Font weights
  weightNormal: 400,
  weightMedium: 500,
  weightSemibold: 600,
  weightBold: 700,
  
  // Letter spacing
  trackingTight: '-0.025em',      // tracking-tight
  trackingWide: '0.025em',        // tracking-wide
  
  // Badge
  badgeSize: '16px',              // w-4 h-4
  badgeFontSize: '10px',          // text-[10px]
  
  // Logo
  logoSize: '28px',               // w-7 h-7
  
  // Bell icon
  bellSize: '20px',               // w-5 h-5
} as const;

export type DashboardTokens = typeof DASHBOARD_TOKENS;
