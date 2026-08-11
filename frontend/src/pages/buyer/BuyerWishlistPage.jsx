import { FiHeart } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BuyerWishlistPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiHeart size={22} className="text-red-500" /> My Wishlist
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Products you've saved for later</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 text-center py-16">
        <p className="text-5xl mb-3">💝</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">Your wishlist is empty</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Save products you love to revisit them later</p>
        <Link to="/search" className="btn-primary rounded-xl px-6 text-sm">Browse Products</Link>
      </div>
    </div>
  );
};

export default BuyerWishlistPage;
