/**
 * Floating add patient button
 * - Fixed position at bottom-right
 * - Primary blue styling
 * - Clear but not aggressive
 */

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface AddPatientButtonProps {
  onClick: () => void;
}

export function AddPatientButton({ onClick }: AddPatientButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    >
      <Plus className="w-5 h-5" />
      <span className="hidden sm:inline">Добавить пациента</span>
    </motion.button>
  );
}
