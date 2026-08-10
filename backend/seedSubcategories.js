const { Category } = require('./models');
const sequelize = require('./config/db');

const subcategoriesCatalog = {
  'electronics-tech': [
    { name: 'Mobiles & Smartphones', description: 'Apple, Samsung, Vivo, Oppo, Realme, Poco' },
    { name: 'Mobile Accessories', description: 'Cases, Covers, Headphones, Power Banks, Screenguards' },
    { name: 'Smart Wearable Tech', description: 'Smartwatches, VR Glasses, Fitness Bands' },
    { name: 'Laptops & Computers', description: 'Gaming Laptops, Desktop PCs, MacBooks' },
    { name: 'Computer Accessories', description: 'Hard Disks, Pendrives, Keyboards, Mice, Laptop Bags' },
    { name: 'Audio & Speakers', description: 'Soundbars, Bluetooth Speakers, Home Audio, Earphones' },
    { name: 'Cameras & Photography', description: 'DSLR, Action Cameras, Tripods, Lenses' },
  ],
  'mobiles-accessories': [
    { name: 'iPhones & iOS Mobiles', description: 'iPhone 15 Pro, iPhone 14, iPhone 13, Apple Care' },
    { name: 'Android Smartphones', description: 'Samsung Galaxy, OnePlus, Vivo, Oppo, Xiaomi, Realme' },
    { name: 'Mobile Cases & Covers', description: 'Silicone, Transparent, Armor, Flip Covers' },
    { name: 'Screen Protectors & Guard', description: 'Tempered Glass, UV Glass, Matte Guards' },
    { name: 'Power Banks & Fast Chargers', description: '10000mAh, 20000mAh, Type C Cables, Wireless Chargers' },
    { name: 'Bluetooth Earphones & TWS', description: 'AirPods, Noise Cancelling Earbuds, Neckbands' },
  ],
  'fashion-apparel': [
    { name: "Men's Footwear", description: 'Sports Shoes, Formal Shoes, Casual Shoes, Sneakers, Loafers' },
    { name: "Men's Clothing", description: 'T-Shirts, Shirts, Jeans, Trousers, Jackets, Suits & Blazers' },
    { name: "Men's Grooming", description: 'Perfumes, Deodorants, Trimmers, Beard Care' },
    { name: "Women's Clothing", description: 'Sarees, Kurtas, Dresses, Tops, Jeans, Lehenga Choli' },
    { name: "Women's Footwear & Bags", description: 'Heels, Sandals, Handbags, Clutches, Sling Bags' },
    { name: 'Jewellery & Watches', description: 'Artificial Jewellery, Silver Jewellery, Fastrack, Casio, Fossil' },
  ],
  'home-kitchen': [
    { name: 'Kitchen & Dining', description: 'Dinner Sets, Water Bottles, Flasks, Storage Containers' },
    { name: 'Cookware & Bakeware', description: 'Non-Stick Pans, Pressure Cookers, Tawas, Kadhai' },
    { name: 'Living Room Furniture', description: 'Sofas, Coffee Tables, TV Units, Shoe Racks' },
    { name: 'Home Decor & Plants', description: 'Wall Paintings, Clocks, Showpieces, Artificial Plants' },
    { name: 'Lighting & Lamps', description: 'LED Bulbs, Ceiling Lights, Table Lamps, Decorative Lights' },
  ],
  'beauty-personal-care': [
    { name: 'Makeup & Cosmetics', description: 'Lipsticks, Foundations, Eyeliners, Mascara' },
    { name: 'Skincare & Sunscreen', description: 'Face Wash, Moisturizers, Serums, Sunscreen Lotion' },
    { name: 'Hair Care & Shampoos', description: 'Shampoo, Hair Oil, Conditioners, Hair Serum' },
    { name: 'Fragrances & Deodorants', description: 'Perfumes, Body Sprays, Deodorants, Roll-ons' },
    { name: 'Grooming Appliances', description: 'Trimmers, Hair Dryers, Hair Straighteners' },
  ],
  'toys-baby-kids': [
    { name: 'Toys & Board Games', description: 'Remote Control Cars, Building Blocks, Puzzles, Dolls' },
    { name: 'Baby Clothing & Rompers', description: 'Cotton Onesies, Baby Suits, Booties, Caps' },
    { name: 'Diapers & Baby Hygiene', description: 'Pants Diapers, Wet Wipes, Baby Powder, Lotion' },
    { name: 'School Supplies & Bags', description: 'School Backpacks, Pencil Boxes, Water Bottles' },
  ],
  'sports-fitness': [
    { name: 'Gym & Fitness Equipment', description: 'Dumbbells, Treadmills, Exercise Bikes, Resistance Bands' },
    { name: 'Sportswear & Tracksuits', description: 'Gym T-Shirts, Trackpants, Shorts, Sports Bras' },
    { name: 'Racquet Sports', description: 'Badminton Racquets, Shuttlecocks, Tennis Racquets' },
    { name: 'Team Sports Equipment', description: 'Cricket Bats, Footballs, Basketballs, Volleyballs' },
  ],
  'smart-appliances': [
    { name: 'Televisions', description: 'Smart & Ultra HD, OLED, QLED, 32 to 65 inch' },
    { name: 'Washing Machines', description: 'Fully Automatic Front Load, Top Load, Semi Automatic' },
    { name: 'Air Conditioners', description: 'Inverter ACs, Split ACs, Window ACs' },
    { name: 'Refrigerators', description: 'Single Door, Double Door, Side by Side, Convertible' },
    { name: 'Kitchen Appliances', description: 'Microwaves, OTG, Mixer Grinders, Electric Kettles, Chimneys' },
    { name: 'Small Home Appliances', description: 'Water Purifiers, Vacuum Cleaners, Geysers, Air Coolers' },
  ],
  'footwear-shoes': [
    { name: 'Sports & Running Shoes', description: 'Nike, Adidas, Puma, Campus, Asian Shoes' },
    { name: 'Casual Sneakers & Canvas', description: 'High Tops, White Sneakers, Slip-On Canvas' },
    { name: 'Formal Shoes', description: 'Oxford Shoes, Derby Shoes, Leather Loafers' },
    { name: 'Sandals & Floaters', description: 'Strappy Sandals, Leather Floaters, Outdoor Sandals' },
    { name: 'Flip-Flops & Slippers', description: 'Rubber Flip-Flops, Ortho Slippers, Slides' },
  ],
  'grocery-gourmet': [
    { name: 'Atta, Rice & Dal', description: 'Chakki Fresh Atta, Basmati Rice, Toor Dal, Chana Dal' },
    { name: 'Edible Oil & Ghee', description: 'Mustard Oil, Sunflower Oil, Cow Ghee, Olive Oil' },
    { name: 'Snacks & Beverages', description: 'Biscuits, Chips, Tea, Coffee, Juices, Energy Drinks' },
    { name: 'Spices & Masalas', description: 'Garam Masala, Turmeric Powder, Red Chilli, Cumin Seeds' },
  ],
  'automotive-accessories': [
    { name: 'Riding Helmets & Masks', description: 'Full Face Helmets, Modular Helmets, Riding Balaclavas' },
    { name: 'Car Electronics & Music', description: 'Car Touchscreens, Dash Cams, Car Chargers, Bluetooth Receivers' },
    { name: 'Car Cleaning & Polish', description: 'Car Wash Shampoos, Microfiber Cloths, Dashboard Polish' },
  ],
  'books-stationery': [
    { name: 'Fiction & Novels', description: 'Thrillers, Romance, Fantasy, Sci-Fi Novels' },
    { name: 'Self-Help & Business', description: 'Personal Growth, Finance, Leadership, Biographies' },
    { name: 'Notebooks & Pens', description: 'Spiral Notebooks, Gel Pens, Highlighters, Sticky Notes' },
  ],
  'gaming-consoles': [
    { name: 'PlayStation Consoles & Games', description: 'PS5 Consoles, PS5 Controllers, PS5 Games' },
    { name: 'Xbox & PC Gaming', description: 'Xbox Series X, PC Controllers, Gaming Keyboards' },
    { name: 'Gaming Accessories', description: 'Gaming Headsets, Mousepads, RGB Controllers, Chairs' },
  ],
  'jewellery-watches': [
    { name: 'Men Watch Collection', description: 'Chronograph Watches, Analog Watches, Smartwatches' },
    { name: 'Women Fashion Jewellery', description: 'Earrings, Necklaces, Bracelets, Rings' },
  ],
  'furniture-decor': [
    { name: 'Cookware & Kitchenware', description: 'Pans, Tawas, Pressure Cookers, Gas Stoves, Kitchen Tools' },
    { name: 'Living Room Furniture', description: 'Sofas, Sofa Beds, Recliners, TV Units, Coffee Tables' },
    { name: 'Bedroom Furniture', description: 'Beds, Mattresses, Wardrobes, Dressing Tables' },
    { name: 'Furnishings & Linen', description: 'Bedsheets, Curtains, Cushions, Blankets, Towels' },
    { name: 'Home Decor & Lighting', description: 'Wall Shelves, Paintings, Clocks, Bulbs, Table Lamps' },
  ],
  '2-wheelers-parts': [
    { name: 'Riding Jackets & Gloves', description: 'Armor Jackets, Leather Riding Gloves, Knee Guards' },
    { name: 'Helmets & Accessories', description: 'Studds, Vega, Steelbird Helmets, Visors' },
  ],
};

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    for (const [parentSlug, subs] of Object.entries(subcategoriesCatalog)) {
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
            console.log(`+ Created Subcategory: "${sub.name}" under "${parentCat.name}"`);
          }
        }
      }
    }
    console.log('✅ ALL Subcategories successfully seeded in database!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding subcategories:', err);
    process.exit(1);
  }
}

seed();
