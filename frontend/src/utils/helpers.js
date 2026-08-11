// Format price in INR
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Get image URL
export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  if (typeof path === 'string' && path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

// Get status color class
export const getStatusColor = (status) => {
  const colors = {
    pending: 'badge-warning',
    confirmed: 'badge-primary',
    processing: 'badge-primary',
    shipped: 'badge-primary',
    delivered: 'badge-success',
    cancelled: 'badge-danger',
    paid: 'badge-success',
    failed: 'badge-danger',
    refunded: 'badge-warning',
  };
  return colors[status] || 'badge-primary';
};

// Get category icon/emoji helper
export const getCategoryIcon = (slug, icon) => {
  if (icon && typeof icon === 'string' && icon.trim()) return icon;
  const s = slug ? slug.toLowerCase() : '';
  if (s.includes('electronics') || s.includes('tech')) return '💻';
  if (s.includes('fashion') || s.includes('apparel') || s.includes('clothing')) return '👕';
  if (s.includes('mobile') || s.includes('phone') || s.includes('accessories')) return '📱';
  if (s.includes('home') || s.includes('decor')) return '🛋️';
  if (s.includes('kitchen') || s.includes('dining')) return '🍳';
  if (s.includes('beauty') || s.includes('personal') || s.includes('care')) return '💄';
  if (s.includes('toy') || s.includes('baby') || s.includes('kid')) return '🧸';
  if (s.includes('sport') || s.includes('fitness')) return '🏏';
  if (s.includes('appliance')) return '📺';
  if (s.includes('footwear') || s.includes('shoe')) return '👟';
  if (s.includes('grocery') || s.includes('food')) return '🛒';
  if (s.includes('jewel') || s.includes('watch')) return '⌚';
  if (s.includes('auto') || s.includes('vehicle')) return '🪖';
  if (s.includes('book') || s.includes('stationery')) return '📚';
  if (s.includes('gaming') || s.includes('console')) return '🎮';
  if (s.includes('furniture')) return '🛋️';
  if (s.includes('2-wheeler') || s.includes('bike') || s.includes('scooter')) return '🛵';
  return '🛍️';
};
