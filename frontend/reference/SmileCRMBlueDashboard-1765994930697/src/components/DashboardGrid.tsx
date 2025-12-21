/**
 * Dashboard cards grid - 2x2 layout
 * - Primary action cards
 * - Staggered animation on load
 * - Responsive spacing
 */

import { motion } from 'framer-motion';
import { Users, UserPlus, Megaphone, TrendingUp } from 'lucide-react';
import { DashboardCard } from './DashboardCard';

interface DashboardGridProps {
  totalPatients: number;
  todayVisits: number;
  isDark: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

export function DashboardGrid({
  totalPatients,
  todayVisits,
  isDark,
}: DashboardGridProps) {
  const cards = [
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Мои пациенты',
      description: 'Список всех пациентов',
    },
    {
      icon: <UserPlus className="w-6 h-6" />,
      title: 'Добавить пациента',
      description: 'Новый пациент',
    },
    {
      icon: <Megaphone className="w-6 h-6" />,
      title: 'Маркетинг',
      description: 'Напоминания, акции, поздравления',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Статистика',
      description: 'Аналитика практики',
      stats: [
        { label: 'Всего пациентов', value: totalPatients },
        { label: 'Сегодня визитов', value: todayVisits },
      ],
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
    >
      {cards.map((card, index) => (
        <motion.div key={index} variants={itemVariants}>
          <DashboardCard {...card} isDark={isDark} />
        </motion.div>
      ))}
    </motion.div>
  );
}
