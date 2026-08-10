import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';

const CustomSelect = ({ label, icon: Icon, value, options = [], onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-surface-100 hover:bg-surface-200 dark:bg-gray-800 dark:hover:bg-gray-700/80 px-3.5 py-2 rounded-xl border border-gray-200/80 dark:border-gray-700 font-bold text-xs text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
      >
        {Icon && <Icon size={14} className="text-gray-400" />}
        {label && <span className="text-gray-400 font-medium">{label}:</span>}
        <span>{selectedOption?.label || value}</span>
        <FiChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 py-2 z-50 animate-slide-up max-h-64 overflow-y-auto">
          {options.map((option) => {
            const isSelected = String(option.value) === String(value);
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-gray-800 text-primary-600 dark:text-primary-400 font-black'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-surface-50 dark:hover:bg-gray-800/60'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <FiCheck size={14} className="text-primary-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
