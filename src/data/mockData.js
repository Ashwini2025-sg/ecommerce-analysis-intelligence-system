// E-Commerce Dataset Generator matching exact project requirements
// Products, Categories, Countries, Gender distribution and 10,000 record generator

export const PRODUCTS_MASTER = [
  { name: 'Laptop', category: 'Electronics', price: 950.00, cost: 600.00 },
  { name: 'Smartphone', category: 'Electronics', price: 750.00, cost: 450.00 },
  { name: 'Headphones', category: 'Accessories', price: 150.00, cost: 70.00 },
  { name: 'Smartwatch', category: 'Wearables', price: 280.00, cost: 140.00 },
  { name: 'Tablet', category: 'Electronics', price: 420.00, cost: 220.00 },
  { name: 'Keyboard', category: 'Accessories', price: 85.00, cost: 35.00 },
  { name: 'Mouse', category: 'Accessories', price: 45.00, cost: 18.00 },
  { name: 'Monitor', category: 'Electronics', price: 320.00, cost: 180.00 },
  { name: 'Camera', category: 'Electronics', price: 890.00, cost: 520.00 },
  { name: 'Speaker', category: 'Audio', price: 120.00, cost: 55.00 }
];

export const CATEGORIES_LIST = ['Electronics', 'Accessories', 'Wearables', 'Audio'];

export const COUNTRIES_LIST = ['India', 'USA', 'UK', 'Germany', 'Canada', 'Australia'];

export const INITIAL_PRODUCTS = PRODUCTS_MASTER.map((p, i) => ({
  id: `PROD-${101 + i}`,
  name: p.name,
  category: p.category,
  price: p.price,
  cost: p.cost,
  stockLevel: Math.floor(Math.random() * 80) + 15,
  reorderPoint: 20,
  rating: Number((4.2 + Math.random() * 0.7).toFixed(1)),
  reviewsCount: Math.floor(Math.random() * 400) + 100,
  turnoverRate: Number((5.0 + Math.random() * 10).toFixed(1))
}));

/**
 * Generate synthetic e-commerce transactions adhering strictly to the Python script specs:
 * 10,000 transactions, customer IDs 1001-2000, Countries, Quantities 1-5, Prices, Purchase Dates across 2025.
 */
export function generateSyntheticTransactions(count = 1500) {
  const transactions = [];
  const startDate = new Date('2025-01-01T00:00:00');
  const endDate = new Date('2025-12-31T23:59:59');
  const timeSpan = endDate.getTime() - startDate.getTime();

  // Pre-assign gender for customer IDs 1001 to 2000
  const customerGenders = {};
  for (let cid = 1001; cid <= 2000; cid++) {
    customerGenders[cid] = Math.random() < 0.55 ? 'Male' : 'Female';
  }

  const customerNamesList = [
    'Aarav Sharma', 'Emma Watson', 'Liam Smith', 'Sophia Miller', 'Noah Davis',
    'Priya Patel', 'Lucas Garcia', 'Oliver Taylor', 'Isabella Wilson', 'Ethan Brown',
    'Amelia Thomas', 'Alexander White', 'Mia Martin', 'Benjamin Clark', 'Charlotte Rodriguez'
  ];

  for (let i = 1; i <= count; i++) {
    const customerId = Math.floor(Math.random() * 1000) + 1001; // 1001 to 2000
    const gender = customerGenders[customerId];
    
    // Pick product
    const prodObj = PRODUCTS_MASTER[Math.floor(Math.random() * PRODUCTS_MASTER.length)];
    const country = COUNTRIES_LIST[Math.floor(Math.random() * COUNTRIES_LIST.length)];
    
    const quantity = Math.floor(Math.random() * 5) + 1; // 1 to 5
    // Price variation around default item price
    const unitPrice = Number((prodObj.price * (0.85 + Math.random() * 0.3)).toFixed(2));
    const totalAmount = Number((quantity * unitPrice).toFixed(2));
    const totalCost = Number((quantity * prodObj.cost).toFixed(2));
    const profit = Number((totalAmount - totalCost).toFixed(2));

    // Random date in 2025
    const randomTime = startDate.getTime() + Math.random() * timeSpan;
    const orderDate = new Date(randomTime);

    const customerName = `${customerNamesList[(customerId - 1001) % customerNamesList.length]} (#${customerId})`;

    let status = 'Completed';
    const randStatus = Math.random();
    if (randStatus < 0.05) status = 'Returned';
    else if (randStatus < 0.08) status = 'Pending';

    transactions.push({
      id: `ORD-${10000 + i}`,
      date: orderDate.toISOString(),
      timestamp: orderDate.getTime(),
      customerId: `CUST-${customerId}`,
      rawCustomerId: customerId,
      customerName,
      gender,
      country,
      region: country, // Aliased for region filters
      productCategory: prodObj.category,
      productId: `PROD-${prodObj.name.toUpperCase()}`,
      productName: prodObj.name,
      quantity,
      unitPrice,
      totalAmount,
      totalCost,
      profit,
      paymentMethod: ['Credit Card', 'PayPal', 'UPI / NetBanking', 'Apple Pay'][Math.floor(Math.random() * 4)],
      status
    });
  }

  return transactions.sort((a, b) => b.timestamp - a.timestamp);
}

export const INITIAL_REVIEWS = [
  { id: 'REV-1', productId: 'PROD-LAPTOP', productName: 'Laptop', customerName: 'Aarav Sharma', rating: 5, sentiment: 'Positive', score: 0.95, comment: 'Incredible performance for multitasking and software development. Fast boot times and great screen color accuracy!', topic: 'Performance & Display', date: '2025-11-14' },
  { id: 'REV-2', productId: 'PROD-SMARTPHONE', productName: 'Smartphone', customerName: 'Emma Watson', rating: 5, sentiment: 'Positive', score: 0.92, comment: 'Crisp camera resolution, smooth 120Hz display, and easily lasts all day on a single charge.', topic: 'Camera & Battery', date: '2025-10-22' },
  { id: 'REV-3', productId: 'PROD-HEADPHONES', productName: 'Headphones', customerName: 'Liam Smith', rating: 4, sentiment: 'Positive', score: 0.86, comment: 'Active noise cancellation works well on noisy subway commutes. Soft ear cushions.', topic: 'Noise Cancellation & Comfort', date: '2025-09-18' },
  { id: 'REV-4', productId: 'PROD-SMARTWATCH', productName: 'Smartwatch', customerName: 'Priya Patel', rating: 4, sentiment: 'Positive', score: 0.81, comment: 'Accurate heart rate monitoring and workout tracking. Battery life is around 2 days.', topic: 'Fitness & Health Tracking', date: '2025-08-30' },
  { id: 'REV-5', productId: 'PROD-MONITOR', productName: 'Monitor', customerName: 'Lucas Garcia', rating: 2, sentiment: 'Negative', score: -0.72, comment: 'Screen had minor backlight bleed in dark rooms and stand height adjustment is limited.', topic: 'Display Backlight & Ergonomics', date: '2025-07-12' }
];

export const TOPIC_KEYWORDS = [
  { text: 'High Performance', count: 520, sentiment: 'positive' },
  { text: 'Fast Shipping', count: 480, sentiment: 'positive' },
  { text: 'Long Battery Life', count: 390, sentiment: 'positive' },
  { text: 'Great Value', count: 340, sentiment: 'positive' },
  { text: 'Sleek Design', count: 290, sentiment: 'positive' },
  { text: 'Packaging Damaged', count: 92, sentiment: 'negative' },
  { text: 'Minor Backlight Bleed', count: 45, sentiment: 'negative' },
  { text: 'Size Larger Than Expected', count: 78, sentiment: 'neutral' }
];
