/**
 * Patients list container - Exact match to Superdesign reference
 * - Staggered animation on load
 * - max-w-4xl (896px), px-4, space-y-2
 */

import { Box, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { PatientRowCard, type PatientData } from './PatientRowCard';

const MotionBox = motion.create(Box);

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
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
};

interface PatientsListProps {
  patients: PatientData[];
  onPatientClick: (patient: PatientData) => void;
}

export function PatientsList({ patients, onPatientClick }: PatientsListProps) {
  return (
    <MotionBox
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      w="100%"
      maxW="896px" // max-w-4xl
      mx="auto"
      px="16px"
    >
      <VStack spacing="8px" align="stretch">
        {patients.map((patient) => (
          <MotionBox key={patient.id} variants={itemVariants}>
            <PatientRowCard
              patient={patient}
              onClick={() => onPatientClick(patient)}
            />
          </MotionBox>
        ))}
      </VStack>
    </MotionBox>
  );
}

export default PatientsList;

