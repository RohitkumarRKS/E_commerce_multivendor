import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt } from 'react-icons/fa';

const Rating = ({ value = 0, count = 0, showCount = true, size = 'sm' }) => {
  const numVal = parseFloat(value) || 0;
  const numCount = parseInt(count) || 0;
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-center gap-1.5 my-1">
      {numVal > 0 ? (
        <span className={`inline-flex items-center gap-0.5 bg-emerald-600 dark:bg-emerald-500 text-white ${sizeClass} font-extrabold px-1.5 py-0.5 rounded-md shadow-xs`}>
          {numVal.toFixed(1)} <FaStar size={9} />
        </span>
      ) : (
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md">
          New
        </span>
      )}
      {showCount && numCount > 0 && (
        <span className={`${sizeClass} font-semibold text-gray-500 dark:text-gray-400`}>
          ({numCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};

export default Rating;
