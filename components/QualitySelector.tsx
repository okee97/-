
import React from 'react';
import type { QualityOption } from '../types';

interface QualitySelectorProps {
  options: QualityOption[];
  selectedOption: QualityOption;
  onOptionSelect: (option: QualityOption) => void;
}

const QualitySelector: React.FC<QualitySelectorProps> = ({ options, selectedOption, onOptionSelect }) => {
  return (
    <div className="flex w-full bg-gray-100 p-1 rounded-xl">
      {options.map((option) => (
        <button
          key={option.ppi}
          onClick={() => onOptionSelect(option)}
          className={`w-full text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 focus:outline-none ${
            selectedOption.ppi === option.ppi
              ? 'bg-white text-blue-600 shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-200/60'
          }`}
        >
          <span className="block">{option.label}</span>
          <span className="block text-xs opacity-70">{option.description}</span>
        </button>
      ))}
    </div>
  );
};

export default QualitySelector;
