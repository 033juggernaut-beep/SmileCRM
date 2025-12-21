/**
 * Welcome section with medical blue theme
 * - Rounded container with light blue surface
 * - Calm medical typography
 * - Soft shadow, no border noise
 */

import { motion } from 'framer-motion';
import type { WelcomeBlockProps } from '../types';

interface ExtendedWelcomeProps extends WelcomeBlockProps {
  isDark: boolean;
}

export function WelcomeBlock({ title, subtitle, isDark }: ExtendedWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`w-full max-w-3xl mx-auto px-8 py-10 rounded-2xl transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800/60 shadow-xl shadow-slate-900/30'
          : 'bg-gradient-to-br from-blue-50 to-sky-50 shadow-lg shadow-blue-100/50'
      }`}
    >
      <h1
        className={`text-3xl md:text-4xl font-semibold tracking-tight text-center ${
          isDark ? 'text-white' : 'text-slate-800'
        }`}
      >
        {title}
      </h1>
      <p
        className={`mt-3 text-base md:text-lg text-center font-normal ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`}
      >
        {subtitle}
      </p>
    </motion.div>
  );
}
