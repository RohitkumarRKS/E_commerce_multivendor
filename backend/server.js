const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');

// Import models (triggers associations)
require('./models');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bannerRoutes = require('./routes/bannerRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    // Allow any localhost port
    if (/^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const brandRoutes = require('./routes/brandRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const promoRoutes = require('./routes/promoRoutes');
const returnRoutes = require('./routes/returnRoutes');
const emailRoutes = require('./routes/emailRoutes');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promo', promoRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/email', emailRoutes);

// Admin stats endpoint
app.get('/api/admin/stats', require('./middleware/auth'), require('./middleware/role')('superadmin'), async (req, res) => {
  try {
    const { User, Product, Order, OrderItem } = require('./models');
    const { Op } = require('sequelize');

    const totalUsers = await User.count({ where: { role: { [Op.ne]: 'superadmin' } } });
    const totalSellers = await User.count({ where: { role: 'seller' } });
    const totalBuyers = await User.count({ where: { role: 'buyer' } });
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    const totalRevenue = await Order.sum('totalAmount', {
      where: { paymentStatus: 'paid' },
    });

    const recentOrders = await Order.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalSellers,
          totalBuyers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue || 0,
        },
        recentOrders,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Root & Info endpoints
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to MultiVendor E-Commerce API Server 🚀',
    endpoints: {
      api: '/api',
      health: '/api/health',
      products: '/api/products',
      categories: '/api/categories',
    },
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'MultiVendor REST API v1.0',
    availableEndpoints: [
      'GET  /api/health',
      'GET  /api/products',
      'GET  /api/categories',
      'POST /api/auth/login',
      'POST /api/auth/register',
      'GET  /api/cart',
      'GET  /api/orders',
    ],
  });
});

app.get('/uploads', (req, res) => {
  res.json({
    success: true,
    message: 'Uploads directory. Access uploaded files by file path (e.g. /uploads/products/image.jpg)',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running!', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// Error handler
app.use(errorHandler);

// Database sync and server start
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully.');

    // Sync models & auto-migrate SQLite columns
    await sequelize.sync();
    try {
      const { DataTypes } = require('sequelize');
      const queryInterface = sequelize.getQueryInterface();
      
      // Auto-migrate categories table
      const categoryCols = await queryInterface.describeTable('categories');
      if (!categoryCols.show_in_navbar) {
        await queryInterface.addColumn('categories', 'show_in_navbar', { type: DataTypes.BOOLEAN, defaultValue: true });
      }
      if (!categoryCols.icon) {
        await queryInterface.addColumn('categories', 'icon', { type: DataTypes.STRING(50), allowNull: true });
      }

      // Auto-migrate products table
      const productCols = await queryInterface.describeTable('products');
      if (!productCols.is_cod_available) {
        await queryInterface.addColumn('products', 'is_cod_available', { type: DataTypes.BOOLEAN, defaultValue: true });
      }
      if (!productCols.is_free_delivery) {
        await queryInterface.addColumn('products', 'is_free_delivery', { type: DataTypes.BOOLEAN, defaultValue: true });
      }
      if (!productCols.warranty_policy) {
        await queryInterface.addColumn('products', 'warranty_policy', { type: DataTypes.STRING, defaultValue: '1 Year Warranty' });
      }
      if (!productCols.return_policy) {
        await queryInterface.addColumn('products', 'return_policy', { type: DataTypes.STRING, defaultValue: '7 Days Replacement' });
      }
      if (!productCols.min_order_quantity) {
        await queryInterface.addColumn('products', 'min_order_quantity', { type: DataTypes.INTEGER, defaultValue: 1 });
      }
      if (!productCols.is_returnable) {
        await queryInterface.addColumn('products', 'is_returnable', { type: DataTypes.BOOLEAN, defaultValue: true });
      }

      // Auto-migrate orders table for promo codes
      const orderCols = await queryInterface.describeTable('orders');
      if (!orderCols.promo_code_id) {
        await queryInterface.addColumn('orders', 'promo_code_id', { type: DataTypes.UUID, allowNull: true });
      }
      if (!orderCols.discount_amount) {
        await queryInterface.addColumn('orders', 'discount_amount', { type: DataTypes.DECIMAL(10, 2), allowNull: true, defaultValue: 0 });
      }

      // Auto-migrate banners table
      const bannerCols = await queryInterface.describeTable('banners');
      if (!bannerCols.position) {
        await queryInterface.addColumn('banners', 'position', { type: DataTypes.STRING(50), defaultValue: 'hero' });
      }
    } catch (migrationErr) {
      console.log('Migration check completed:', migrationErr.message);
    }
    console.log('✅ Database synced.');

    // Create default superadmin accounts if not exist
    const { User, Category } = require('./models');
    const adminAccounts = [
      { name: 'Super Admin', email: 'admin', password: 'admin@123' },
      { name: 'Super Admin', email: 'admin@indukart.com', password: 'admin@123' },
    ];

    for (const adm of adminAccounts) {
      const existingAdm = await User.findOne({ where: { email: adm.email } });
      if (!existingAdm) {
        await User.create({
          name: adm.name,
          email: adm.email,
          password: adm.password,
          role: 'superadmin',
          isVerified: true,
          isActive: true,
        });
        console.log(`✅ Default superadmin created (${adm.email} / ${adm.password})`);
      } else {
        if (existingAdm.role !== 'superadmin' || !existingAdm.isActive) {
          existingAdm.role = 'superadmin';
          existingAdm.isActive = true;
          await existingAdm.save();
        }
      }
    }

    // Seed default categories if none exist or update to full list
    const categoryImagesMap = {
      'electronics-tech': 'https://images.unsplash.com/photo-1498049860654-af1a5c566876?w=300&auto=format&fit=crop&q=80',
      'fashion-apparel': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&auto=format&fit=crop&q=80',
      'mobiles-accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
      'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&auto=format&fit=crop&q=80',
      'beauty-personal-care': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&auto=format&fit=crop&q=80',
      'toys-baby-kids': 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=300&auto=format&fit=crop&q=80',
      'sports-fitness': 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80',
      'smart-appliances': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=300&auto=format&fit=crop&q=80',
      'footwear-shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
      'grocery-gourmet': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&auto=format&fit=crop&q=80',
      'automotive-accessories': 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=300&auto=format&fit=crop&q=80',
      'books-stationery': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop&q=80',
      'gaming-consoles': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=300&auto=format&fit=crop&q=80',
      'jewellery-watches': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
      'furniture-decor': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80',
      '2-wheelers-parts': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=300&auto=format&fit=crop&q=80',
    };

    const fullCategoriesList = [
      { name: "Today's Deals", slug: 'todays-deals', description: "Special daily discount offers and featured deals", icon: '⚡', sortOrder: -2 },
      { name: "Sell On InduKart", slug: 'sell-on-indukart', description: "Become a seller on InduKart marketplace", icon: '🏪', sortOrder: -1 },
      { name: 'Electronics & Tech', description: 'Smartphones, Laptops, Audio & Accessories', sortOrder: 1 },
      { name: 'Fashion & Apparel', description: 'Men, Women & Kids Clothing, Footwear & Styles', sortOrder: 2 },
      { name: 'Mobiles & Accessories', description: 'Latest Smartphones, Smartwatches & Cases', sortOrder: 3 },
      { name: 'Home & Kitchen', description: 'Furniture, Decor, Cookware & Lighting', sortOrder: 4 },
      { name: 'Beauty & Personal Care', description: 'Skincare, Haircare, Cosmetics & Perfumes', sortOrder: 5 },
      { name: 'Toys, Baby & Kids', description: 'Games, Toys, School Supplies & Baby Care', sortOrder: 6 },
      { name: 'Sports & Fitness', description: 'Gym Equipment, Athletic Wear & Outdoors', sortOrder: 7 },
      { name: 'Smart Appliances', description: 'TVs, Refrigerators, Washing Machines & ACs', sortOrder: 8 },
      { name: 'Footwear & Shoes', description: 'Sneakers, Formal Shoes, Sandals & Boots', sortOrder: 9 },
      { name: 'Grocery & Gourmet', description: 'Daily Essentials, Snacks, Beverages & Organic', sortOrder: 10 },
      { name: 'Automotive & Accessories', description: 'Car Electronics, Helmets, Cleaning & Care', sortOrder: 11 },
      { name: 'Books & Stationery', description: 'Fiction, Non-fiction, Academic & Office Supplies', sortOrder: 12 },
      { name: 'Gaming & Consoles', description: 'PlayStation, Xbox, PC Gaming & Controllers', sortOrder: 13 },
      { name: 'Jewellery & Watches', description: 'Gold, Silver, Fine Jewellery & Smartwatches', sortOrder: 14 },
      { name: 'Furniture & Decor', description: 'Sofa Beds, Tables, Wall Decor & Lamps', sortOrder: 15 },
      { name: '2-Wheelers & Parts', description: 'Helmets, Bikes, Scooters & Riding Gear', sortOrder: 16 },
    ];

    for (const cat of fullCategoriesList) {
      const slug = cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const image = categoryImagesMap[slug] || null;
      const existing = await Category.findOne({ where: { slug } });
      if (!existing) {
        await Category.create({ ...cat, slug, image });
      } else {
        // Ensure sortOrder and icon are updated for special categories
        if (cat.sortOrder !== undefined && existing.sortOrder !== cat.sortOrder) {
          existing.sortOrder = cat.sortOrder;
        }
        if (cat.icon && !existing.icon) {
          existing.icon = cat.icon;
        }
        if (!existing.image && image) {
          existing.image = image;
        }
        await existing.save();
      }
    }
    console.log('✅ 16 E-Commerce categories synced.');

    // Seed default subcategories for major categories matching reference UI
    const defaultSubcategoriesMap = {
      'electronics-tech': [
        { name: 'Mobiles & Smartphones', description: 'Apple, Samsung, Vivo, Oppo, Realme, Poco' },
        { name: 'Mobile Accessories', description: 'Cases, Covers, Headphones, Power Banks, Screenguards' },
        { name: 'Smart Wearable Tech', description: 'Smartwatches, VR Glasses, Fitness Bands' },
        { name: 'Laptops & Computers', description: 'Gaming Laptops, Desktop PCs, MacBooks' },
        { name: 'Computer Accessories', description: 'Hard Disks, Pendrives, Keyboards, Mice, Laptop Bags' },
        { name: 'Audio & Speakers', description: 'Soundbars, Bluetooth Speakers, Home Audio, Earphones' },
        { name: 'Cameras & Photography', description: 'DSLR, Action Cameras, Tripods, Lenses' },
      ],
      'smart-appliances': [
        { name: 'Televisions', description: 'Smart & Ultra HD, OLED, QLED, 32 to 65 inch' },
        { name: 'Washing Machines', description: 'Fully Automatic Front Load, Top Load, Semi Automatic' },
        { name: 'Air Conditioners', description: 'Inverter ACs, Split ACs, Window ACs' },
        { name: 'Refrigerators', description: 'Single Door, Double Door, Side by Side, Convertible' },
        { name: 'Kitchen Appliances', description: 'Microwaves, OTG, Mixer Grinders, Electric Kettles, Chimneys' },
        { name: 'Small Home Appliances', description: 'Water Purifiers, Vacuum Cleaners, Geysers, Air Coolers' },
      ],
      'fashion-apparel': [
        { name: "Men's Footwear", description: 'Sports Shoes, Formal Shoes, Casual Shoes, Sneakers, Loafers' },
        { name: "Men's Clothing", description: 'T-Shirts, Shirts, Jeans, Trousers, Jackets, Suits & Blazers' },
        { name: "Men's Grooming", description: 'Perfumes, Deodorants, Trimmers, Beard Care' },
        { name: "Women's Clothing", description: 'Sarees, Kurtas, Dresses, Tops, Jeans, Lehenga Choli' },
        { name: "Women's Footwear & Bags", description: 'Heels, Sandals, Handbags, Clutches, Sling Bags' },
        { name: 'Jewellery & Watches', description: 'Artificial Jewellery, Silver Jewellery, Fastrack, Casio, Fossil' },
      ],
      'furniture-decor': [
        { name: 'Cookware & Kitchenware', description: 'Pans, Tawas, Pressure Cookers, Gas Stoves, Kitchen Tools' },
        { name: 'Living Room Furniture', description: 'Sofas, Sofa Beds, Recliners, TV Units, Coffee Tables' },
        { name: 'Bedroom Furniture', description: 'Beds, Mattresses, Wardrobes, Dressing Tables' },
        { name: 'Furnishings & Linen', description: 'Bedsheets, Curtains, Cushions, Blankets, Towels' },
        { name: 'Home Decor & Lighting', description: 'Wall Shelves, Paintings, Clocks, Bulbs, Table Lamps' },
      ],
    };

    for (const [parentSlug, subs] of Object.entries(defaultSubcategoriesMap)) {
      const parentCat = await Category.findOne({ where: { slug: parentSlug } });
      if (parentCat) {
        for (let i = 0; i < subs.length; i++) {
          const sub = subs[i];
          const subSlug = sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const existingSub = await Category.findOne({ where: { slug: subSlug } });
          if (!existingSub) {
            await Category.create({
              name: sub.name,
              slug: subSlug,
              description: sub.description,
              parentId: parentCat.id,
              sortOrder: i + 1,
              isActive: true,
            });
          }
        }
      }
    }
    console.log('✅ Rich subcategories auto-seeded for parent categories.');

    // Seed default brands if none exist
    const { Brand } = require('./models');
    const brandCount = await Brand.count();
    if (brandCount === 0) {
      const defaultBrands = [
        { name: 'Apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&auto=format&fit=crop&q=80', sortOrder: 1 },
        { name: 'Sony', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&auto=format&fit=crop&q=80', sortOrder: 2 },
        { name: 'Samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&auto=format&fit=crop&q=80', sortOrder: 3 },
        { name: 'Nike', logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&auto=format&fit=crop&q=80', sortOrder: 4 },
        { name: 'Xiaomi (Mi)', logo: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80', sortOrder: 5 },
        { name: 'Bata', logo: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=200&auto=format&fit=crop&q=80', sortOrder: 6 },
        { name: 'OPPO', logo: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=200&auto=format&fit=crop&q=80', sortOrder: 7 },
        { name: 'Vivo', logo: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=200&auto=format&fit=crop&q=80', sortOrder: 8 },
        { name: 'Mamaearth', logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&auto=format&fit=crop&q=80', sortOrder: 9 },
        { name: 'WOW Skin Science', logo: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&auto=format&fit=crop&q=80', sortOrder: 10 },
        { name: 'Plum', logo: 'https://images.unsplash.com/photo-1608248597263-0044e3e21422?w=200&auto=format&fit=crop&q=80', sortOrder: 11 },
        { name: 'SoundPro', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop&q=80', sortOrder: 12 },
        { name: 'NovaTech', logo: 'https://images.unsplash.com/photo-1609592424082-8418ff89c629?w=200&auto=format&fit=crop&q=80', sortOrder: 13 },
        { name: 'ChefLine', logo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&auto=format&fit=crop&q=80', sortOrder: 14 },
        { name: 'FitFlex', logo: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=200&auto=format&fit=crop&q=80', sortOrder: 15 },
      ];
      for (const b of defaultBrands) {
        await Brand.create({ ...b, isActive: true });
      }
      console.log('✅ Default trusted brands auto-seeded.');
    }

    // Seed default products across categories if none exist
    const { Product } = require('./models');
    const productCount = await Product.count();
    if (productCount === 0) {
      const allCategories = await Category.findAll();
      const catMap = {};
      allCategories.forEach((c) => {
        catMap[c.slug] = c.id;
      });

      const superadminUser = await User.findOne({ where: { role: 'superadmin' } });
      const sellerId = superadminUser ? superadminUser.id : null;

      const sampleProducts = [
        // Electronics & Tech
        {
          name: 'UltraBass Noise Cancelling Wireless Headphones',
          brand: 'SoundPro',
          price: 2999,
          mrp: 5999,
          discount: 50,
          stock: 45,
          isFeatured: true,
          description: 'High fidelity audio with active noise cancellation, 30-hour battery life, and ultra-soft memory foam earcups.',
          catSlug: 'electronics-tech',
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'],
        },
        {
          name: 'ProBook Ultra Slim Laptop i7 16GB / 512GB SSD',
          brand: 'TechVerse',
          price: 64999,
          mrp: 79999,
          discount: 18,
          stock: 20,
          isFeatured: true,
          description: 'Lightweight aluminium laptop powered by Intel i7 processor, FHD IPS display, and backlit keyboard.',
          catSlug: 'electronics-tech',
          images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'],
        },

        // Fashion & Apparel
        {
          name: 'Men Slim Fit Casual Denim Jacket',
          brand: 'UrbanStyle',
          price: 1499,
          mrp: 2999,
          discount: 50,
          stock: 60,
          isFeatured: false,
          description: 'Classic vintage blue denim jacket crafted from premium breathable cotton blend fabric.',
          catSlug: 'fashion-apparel',
          images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80'],
        },
        {
          name: 'Women Designer Printed Silk Saree',
          brand: 'RoyalWeave',
          price: 2499,
          mrp: 4999,
          discount: 50,
          stock: 35,
          isFeatured: true,
          description: 'Elegant festive silk saree with intricate gold zari border work and matching unstitched blouse piece.',
          catSlug: 'fashion-apparel',
          images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'],
        },

        // Mobiles & Accessories
        {
          name: 'Galaxy Z Pro 5G (12GB RAM, 256GB Storage)',
          brand: 'NovaTech',
          price: 49999,
          mrp: 59999,
          discount: 16,
          stock: 15,
          isFeatured: true,
          description: '120Hz AMOLED display, 108MP AI Quad camera system, 5000mAh battery with 67W fast charging.',
          catSlug: 'mobiles-accessories',
          images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'],
        },
        {
          name: 'MagCharge 10,000mAh Magnetic Power Bank',
          brand: 'NovaTech',
          price: 1299,
          mrp: 2499,
          discount: 48,
          stock: 80,
          isFeatured: false,
          description: 'Fast wireless charging power bank with digital LED power indicator and dual Type-C output.',
          catSlug: 'mobiles-accessories',
          images: ['https://images.unsplash.com/photo-1609592424082-8418ff89c629?w=600&auto=format&fit=crop&q=80'],
        },

        // Home & Kitchen
        {
          name: 'Stainless Steel Digital Air Fryer 4.5L',
          brand: 'ChefLine',
          price: 3999,
          mrp: 7999,
          discount: 50,
          stock: 30,
          isFeatured: true,
          description: 'Oil-free healthy cooking air fryer with 8 preset cooking modes and touchscreen LED panel.',
          catSlug: 'home-kitchen',
          images: ['https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80'],
        },

        // Beauty & Personal Care
        {
          name: 'Vitamin C Brightening Facial Serum 30ml',
          brand: 'GlowNatural',
          price: 499,
          mrp: 999,
          discount: 50,
          stock: 100,
          isFeatured: false,
          description: 'Enriched with Hyaluronic Acid & Vitamin E for radiant, glowing skin and dark spot reduction.',
          catSlug: 'beauty-personal-care',
          images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80'],
        },

        // Toys, Baby & Kids
        {
          name: 'Remote Control 4WD Stunt Racing Car',
          brand: 'PlayToy',
          price: 899,
          mrp: 1799,
          discount: 50,
          stock: 50,
          isFeatured: false,
          description: '360-degree rotating stunt car with LED lights and rechargeable battery for endless fun.',
          catSlug: 'toys-baby-kids',
          images: ['https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80'],
        },

        // Sports & Fitness
        {
          name: 'Adjustable Dumbbell Set (20kg Kit)',
          brand: 'FitFlex',
          price: 2999,
          mrp: 4999,
          discount: 40,
          stock: 25,
          isFeatured: true,
          description: 'Heavy duty chrome weight plates with non-slip padded handles for home gym workouts.',
          catSlug: 'sports-fitness',
          images: ['https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80'],
        },

        // Smart Appliances
        {
          name: '55" Ultra HD 4K Smart LED Android TV',
          brand: 'VividVision',
          price: 32999,
          mrp: 49999,
          discount: 34,
          stock: 18,
          isFeatured: true,
          description: 'Dolby Audio sound system, bezel-less screen, voice remote with built-in Chromecast and Netflix.',
          catSlug: 'smart-appliances',
          images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80'],
        },
      ];

      for (const prod of sampleProducts) {
        const categoryId = catMap[prod.catSlug] || Object.values(catMap)[0];
        const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        delete prod.catSlug;
        await Product.create({
          ...prod,
          slug,
          categoryId,
          sellerId,
          isActive: true,
          rating: 4.5,
          numReviews: Math.floor(Math.random() * 50) + 10,
        });
      }
      console.log('✅ Sample products auto-seeded across all categories.');
    }

    // Auto-update any existing products without images
    const defaultImagesMap = {
      'electronics-tech': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      'fashion-apparel': 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
      'mobiles-accessories': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      'home-kitchen': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      'beauty-personal-care': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
      'toys-baby-kids': 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&auto=format&fit=crop&q=80',
      'sports-fitness': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80',
      'smart-appliances': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format&fit=crop&q=80',
    };

    const existingProds = await Product.findAll();
    for (const p of existingProds) {
      if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
        const cat = p.categoryId ? await Category.findByPk(p.categoryId) : null;
        const imgUrl = (cat && defaultImagesMap[cat.slug]) || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
        p.images = [imgUrl];
        await p.save();
      }
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API: http://localhost:${PORT}/api`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
