/**
 * Patients list container
 * - Renders list of PatientRow components
 * - Staggered animation on load
 * - Proper spacing between rows
 */

import { motion } from 'framer-motion';
import { PatientRow } from './PatientRow';
import type { Patient } from '../types';

interface PatientsListProps {
  patients: Patient[];
  isDark: boolean;
  onPatientClick: (patient: Patient) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
};

export function PatientsList({
  patients,
  isDark,
  onPatientClick,
}: PatientsListProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto px-4 space-y-2"
    >
      {patients.map((patient) => (
        <motion.div key={patient.id} variants={itemVariants}>
          <PatientRow
            patient={patient}
            isDark={isDark}
            onClick={() => onPatientClick(patient)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
