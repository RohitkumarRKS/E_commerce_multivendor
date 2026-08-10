import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, truncateText } from '../../utils/helpers';
import Rating from './Rating';

const ProductCard = ({ product }) => {
  const mainImage = product.images?.[0] || null;
  const cleanSlug = product.slug ? product.slug.replace(/-\d{10,}$/, '') : '';
  const productUrl = product.category?.slug
    ? `/category/${product.category.slug}/${cleanSlug}`
    : `/product/${cleanSlug}`;

  return (
    <Link to={productUrl} className="product-card group block rounded-2xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700/60 shadow-card hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300" id={`product-card-${product.id}`}>
      {/* Image */}
      <div className="relative aspect-square bg-white p-4 flex items-center justify-center overflow-hidden">
        <img
          src={getImageUrl(mainImage)}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
            {product.discount}% OFF
          </span>
        )}
        {Boolean(product.isFeatured) && (
          <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Featured
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-50">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          {product.brand || product.category?.name || 'General'}
        </p>
        <h3 className="text-sm font-medium text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
          {truncateText(product.name, 60)}
        </h3>

        <Rating value={parseFloat(product.rating) || 0} count={product.numReviews || 0} />

        <div className="flex items-baseline gap-2 mt-2">
          <span className="price">{formatPrice(product.price)}</span>
          {product.discount > 0 && (
            <>
              <span className="price-mrp">{formatPrice(product.mrp)}</span>
              <span className="price-discount">{product.discount}% off</span>
            </>
          )}
        </div>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-danger mt-1.5 font-medium">Only {product.stock} left!</p>
        )}

        {product.seller?.storeName && (
          <p className="text-xs text-gray-400 mt-2 truncate">
            by {product.seller.storeName}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
