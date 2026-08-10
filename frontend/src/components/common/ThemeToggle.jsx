import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95 flex items-center justify-center ${className}`}
      title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Day Mode'}
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <FiMoon size={18} className="text-amber-500 hover:text-amber-600 transition-colors" />
      ) : (
        <FiSun size={18} className="text-yellow-400 hover:text-yellow-300 transition-colors" />
      )}
    </button>
  );
};

export default ThemeToggle;
