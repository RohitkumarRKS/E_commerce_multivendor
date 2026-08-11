const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// User <-> Product (Seller has many products)
User.hasMany(Product, { foreignKey: 'sellerId', as: 'products' });
Product.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category self-reference (parent/children subcategories)
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

// User <-> Cart (one-to-one)
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Cart <-> CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// CartItem <-> Product
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// OrderItem <-> Product
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// OrderItem <-> User (seller)
User.hasMany(OrderItem, { foreignKey: 'sellerId', as: 'sellerOrderItems' });
OrderItem.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

const Banner = require('./Banner');
const Brand = require('./Brand');
const Review = require('./Review');
const PromoCode = require('./PromoCode');
const PromoUsage = require('./PromoUsage');
const ReturnRequest = require('./ReturnRequest');
const EmailLog = require('./EmailLog');
const EmailSetting = require('./EmailSetting');

// Product <-> Review
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User (Seller) <-> PromoCode
User.hasMany(PromoCode, { foreignKey: 'sellerId', as: 'promoCodes' });
PromoCode.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// PromoCode <-> PromoUsage
PromoCode.hasMany(PromoUsage, { foreignKey: 'promoCodeId', as: 'usages' });
PromoUsage.belongsTo(PromoCode, { foreignKey: 'promoCodeId', as: 'promoCode' });

// User <-> PromoUsage
User.hasMany(PromoUsage, { foreignKey: 'userId', as: 'promoUsages' });
PromoUsage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> PromoUsage
Order.hasMany(PromoUsage, { foreignKey: 'orderId', as: 'promoUsages' });
PromoUsage.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// ReturnRequest Associations
Order.hasMany(ReturnRequest, { foreignKey: 'orderId', as: 'returnRequests' });
ReturnRequest.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

OrderItem.hasOne(ReturnRequest, { foreignKey: 'orderItemId', as: 'returnRequest' });
ReturnRequest.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });

User.hasMany(ReturnRequest, { foreignKey: 'userId', as: 'buyerReturnRequests' });
ReturnRequest.belongsTo(User, { foreignKey: 'userId', as: 'buyer' });

User.hasMany(ReturnRequest, { foreignKey: 'sellerId', as: 'sellerReturnRequests' });
ReturnRequest.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

module.exports = {
  User,
  Category,
  Product,
  Cart,
  CartItem,
  Order,
  OrderItem,
  Banner,
  Brand,
  Review,
  PromoCode,
  PromoUsage,
  ReturnRequest,
  EmailLog,
  EmailSetting,
};
