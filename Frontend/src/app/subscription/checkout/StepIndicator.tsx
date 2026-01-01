'use client'
import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  stepNumber: number;
  currentStep: number;
  label: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ stepNumber, currentStep, label }) => {
  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;

  let bgClass = "bg-gray-600";
  let textClass = "text-white";

  if (isActive) {
    bgClass = "bg-black";
    textClass = "text-white";
  } else if (isCompleted) {
    bgClass = "bg-[#10b981]";
    textClass = "text-white";
  }

  return (
    <div className="flex items-center space-x-3">
      <div 
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${bgClass} ${textClass}`}
      >
        {isCompleted ? <Check size={14} strokeWidth={3} /> : stepNumber}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
};

export default StepIndicator;