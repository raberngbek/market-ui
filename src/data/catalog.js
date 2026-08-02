const image = (id, width = 900) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const categories = [
  { name: 'Fresh Produce', image: image('photo-1542838132-92c53300491e', 300) },
  { name: 'Ready to Eat', image: image('photo-1547592180-85f173990554', 300) },
  { name: 'Meat & Seafood', image: image('photo-1601050690597-df0568f70950', 300) },
  { name: 'Dairy & Eggs', image: image('photo-1563636619-e9143da7973b', 300) },
  { name: 'Bakery', image: image('photo-1509440159596-0249088772ff', 300) },
  { name: 'Pantry', image: image('photo-1547592180-85f173990554', 300) },
  { name: 'Drinks', image: image('photo-1551024601-bec78aea704b', 300) },
  { name: 'Organic Market', image: image('photo-1543352634-a1c51d9f1fa7', 300) },
];

export const products = [
  { id: 'market-greens-box', name: 'Market Greens Seasonal Vegetable Box', short: 'Seasonal Vegetable Box', category: 'Fresh Produce', brand: 'Good Earth Farm', price: 18.5, oldPrice: 22, rating: 4.9, reviews: 184, sold: 693, stock: 32, badge: 'Picked today', colors: ['#43864d', '#e7bf75'], image: image('photo-1540420773420-3366772f4999'), gallery: [image('photo-1540420773420-3366772f4999'), image('photo-1512621776951-a57141f2eefd')], featured: true },
  { id: 'sunrise-strawberries', name: 'Sunrise Sweet Strawberries, 1 lb', short: 'Sunrise Sweet Strawberries', category: 'Fresh Produce', brand: 'Berry & Co.', price: 5.99, oldPrice: 7.49, rating: 4.8, reviews: 121, sold: 510, stock: 18, badge: 'Best seller', colors: ['#d74437', '#5e9f54'], image: image('photo-1464965911861-746a04b4bca6'), gallery: [image('photo-1464965911861-746a04b4bca6'), image('photo-1490474418585-ba9bad8fd0ea')], featured: true },
  { id: 'basil-pesto-pasta', name: 'Basil Pesto Pasta Bowl, Ready in Minutes', short: 'Basil Pesto Pasta Bowl', category: 'Ready to Eat', brand: 'Kitchen Kind', price: 10.5, oldPrice: 13, rating: 4.7, reviews: 92, sold: 388, stock: 14, badge: 'Ready to eat', colors: ['#638b4e', '#f4dd98'], image: image('photo-1473093295043-cdd812d0e601'), gallery: [image('photo-1473093295043-cdd812d0e601'), image('photo-1498579397066-22750a3cb424')], featured: true },
  { id: 'wild-salmon', name: 'Wild-Caught Atlantic Salmon Fillets', short: 'Wild Atlantic Salmon Fillets', category: 'Meat & Seafood', brand: 'Harbor Catch', price: 16.99, oldPrice: 20, rating: 4.9, reviews: 74, sold: 172, stock: 9, badge: 'Fresh catch', colors: ['#e77763', '#224e6a'], image: image('photo-1467003909585-2f8a72700288'), gallery: [image('photo-1467003909585-2f8a72700288'), image('photo-1544943910-4c1dc44aab44')] },
  { id: 'free-range-eggs', name: 'Free-Range Brown Eggs, Dozen', short: 'Free-Range Brown Eggs', category: 'Dairy & Eggs', brand: 'Sunfield Eggs', price: 6.25, oldPrice: 7.5, rating: 4.8, reviews: 206, sold: 894, stock: 45, badge: 'Farm fresh', colors: ['#c89555', '#f1e3c5'], image: image('photo-1582722872445-44dc5f7e3c8f'), gallery: [image('photo-1582722872445-44dc5f7e3c8f'), image('photo-1518568740560-333139a27e72')] },
  { id: 'sourdough-loaf', name: 'Crusty Country Sourdough Loaf', short: 'Country Sourdough Loaf', category: 'Bakery', brand: 'Early Bird Bakery', price: 7.5, oldPrice: 9, rating: 4.9, reviews: 143, sold: 649, stock: 12, badge: 'Baked this morning', colors: ['#ba8042'], image: image('photo-1509440159596-0249088772ff'), gallery: [image('photo-1509440159596-0249088772ff'), image('photo-1549931319-a545dcf3bc73')] },
  { id: 'olive-oil', name: 'Cold-Pressed Extra Virgin Olive Oil, 500ml', short: 'Extra Virgin Olive Oil', category: 'Pantry', brand: 'Olive Grove', price: 14.99, oldPrice: 18, rating: 4.7, reviews: 67, sold: 225, stock: 20, badge: 'New pantry pick', colors: ['#496836', '#d7b65e'], image: image('photo-1474979266404-7eaacbcd87c5'), gallery: [image('photo-1474979266404-7eaacbcd87c5'), image('photo-1594608661623-aa0bd3a69d98')] },
  { id: 'whole-milk', name: 'Cream-Top Organic Whole Milk, 1L', short: 'Organic Whole Milk', category: 'Dairy & Eggs', brand: 'Meadow Lane', price: 4.75, oldPrice: 5.5, rating: 4.6, reviews: 88, sold: 441, stock: 26, badge: 'Organic', colors: ['#f8f8ed', '#6ca3a4'], image: image('photo-1563636619-e9143da7973b'), gallery: [image('photo-1563636619-e9143da7973b'), image('photo-1550583724-b2692b85b150')] },
  { id: 'citrus-sparkler', name: 'Sparkling Citrus & Mint Water, 4 Pack', short: 'Citrus & Mint Sparkling Water', category: 'Drinks', brand: 'Daybreak', price: 8.5, oldPrice: 10, rating: 4.6, reviews: 58, sold: 352, stock: 30, badge: 'Chilled', colors: ['#d4d04d', '#a5d3dc'], image: image('photo-1551024601-bec78aea704b'), gallery: [image('photo-1551024601-bec78aea704b'), image('photo-1523362628745-0c100150b504')] },
  { id: 'rainbow-bowl', name: 'Rainbow Harvest Salad Bowl', short: 'Rainbow Harvest Salad Bowl', category: 'Ready to Eat', brand: 'Kitchen Kind', price: 11.99, oldPrice: 14, rating: 4.8, reviews: 112, sold: 418, stock: 11, badge: 'Lunch favorite', colors: ['#7eaf59', '#e8ad51'], image: image('photo-1512621776951-a57141f2eefd'), gallery: [image('photo-1512621776951-a57141f2eefd'), image('photo-1498837167922-ddd27525d352')] },
  { id: 'avocado-pack', name: 'Perfectly Ripe Hass Avocados, 4 Pack', short: 'Perfectly Ripe Avocados', category: 'Fresh Produce', brand: 'Good Earth Farm', price: 6.99, oldPrice: 8.5, rating: 4.7, reviews: 159, sold: 602, stock: 22, badge: 'Ready today', colors: ['#5b8148', '#263f2d'], image: image('photo-1523049673857-eb18f1d7b578'), gallery: [image('photo-1523049673857-eb18f1d7b578'), image('photo-1601039641847-7857b994d704')] },
  { id: 'tomato-soup', name: 'Slow-Simmered Tomato & Basil Soup', short: 'Tomato & Basil Soup', category: 'Ready to Eat', brand: 'Kitchen Kind', price: 8.75, oldPrice: 11, rating: 4.8, reviews: 47, sold: 187, stock: 16, badge: 'Comfort food', colors: ['#ca523d', '#5f8043'], image: image('photo-1547592180-85f173990554'), gallery: [image('photo-1547592180-85f173990554'), image('photo-1476718406336-bb5a9690ee2a')] },
];

export const posts = [
  { slug: 'how-to-build-a-week-of-easy-meals', title: 'How to build a week of easy, good meals', category: 'Kitchen notes', date: 'June 14, 2026', image: image('photo-1498837167922-ddd27525d352', 1000), excerpt: 'A short grocery list, a flexible plan, and five nights of food you will look forward to.' },
  { slug: 'what-fresh-really-means', title: 'What “fresh today” really means at MarketFresh', category: 'From the farm', date: 'June 07, 2026', image: image('photo-1542838132-92c53300491e', 1000), excerpt: 'Meet the local growers and small producers behind the produce in your basket.' },
  { slug: 'the-20-minute-dinner', title: 'The 20-minute dinner, without compromise', category: 'Quick dinners', date: 'May 28, 2026', image: image('photo-1473093295043-cdd812d0e601', 1000), excerpt: 'A few smart staples can make a weeknight meal feel surprisingly generous.' },
];

export const faqs = [
  ['How soon can I get my groceries?', 'Choose a delivery window at checkout. Most neighborhoods are eligible for delivery in as little as 60 minutes, from 8am to 9pm.'],
  ['How do you keep food fresh in transit?', 'Orders are hand-picked shortly before delivery and packed with insulated totes and cold packs whenever needed.'],
  ['What if an item is unavailable?', 'We will suggest a close replacement for your approval, or automatically refund the unavailable item.'],
  ['Where does MarketFresh food come from?', 'We buy directly from local growers, neighborhood bakeries, and trusted regional makers whenever possible.'],
];
