import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const faqData = [
  // SHIPPING POLICY - USA
  {
    category: 'Shipping',
    question: 'What are the shipping options in the USA?',
    answer: 'We offer free standard shipping (5-7 business days) on orders over $50. Express shipping (2-3 business days) is available for $9.99, and next-day shipping is $19.99.',
    region: 'USA'
  },
  {
    category: 'Shipping',
    question: 'Do you ship to Alaska and Hawaii?',
    answer: 'Yes, we ship to all 50 US states including Alaska and Hawaii. Delivery times may be slightly longer (7-10 business days) for these regions.',
    region: 'USA'
  },
  
  // SHIPPING POLICY - India
  {
    category: 'Shipping',
    question: 'What are the shipping options in India?',
    answer: 'We offer free standard shipping (5-8 business days) on orders over ₹2,000. Express shipping (2-4 business days) is available for ₹299. We ship via reliable courier partners like Blue Dart and Delhivery.',
    region: 'India'
  },
  {
    category: 'Shipping',
    question: 'Do you ship to remote areas in India?',
    answer: 'Yes, we ship to most PIN codes across India. However, delivery to remote areas in Northeast states, J&K, and island territories may take 10-15 business days.',
    region: 'India'
  },
  
  // SHIPPING POLICY - Japan
  {
    category: 'Shipping',
    question: 'What are the shipping options in Japan?',
    answer: 'We offer free standard shipping (3-5 business days) on orders over ¥5,000. Express shipping (1-2 business days) is available for ¥800. We use Japan Post and Yamato Transport.',
    region: 'Japan'
  },
  
  // SHIPPING POLICY - China
  {
    category: 'Shipping',
    question: 'What are the shipping options in China?',
    answer: 'We offer free standard shipping (4-7 business days) on orders over ¥200. Express shipping (2-3 business days) is available for ¥50. We use SF Express and China Post.',
    region: 'China'
  },
  
  // RETURN POLICY - USA
  {
    category: 'Returns',
    question: 'What is your return policy in the USA?',
    answer: 'We accept returns within 30 days of delivery. Items must be unopened and in original packaging. Refunds are processed within 5-7 business days. Return shipping is free for defective items; otherwise, customers pay return shipping.',
    region: 'USA'
  },
  {
    category: 'Returns',
    question: 'How do I initiate a return in the USA?',
    answer: 'Contact our support team via chat or email with your order number. We\'ll send you a prepaid return label if the item is defective. For non-defective returns, you can use any shipping carrier.',
    region: 'USA'
  },
  
  // RETURN POLICY - India
  {
    category: 'Returns',
    question: 'What is your return policy in India?',
    answer: 'We accept returns within 15 days of delivery. Items must be unopened with original packaging and tags. Refunds are processed to the original payment method within 7-10 business days. Return pickup is free for defective items.',
    region: 'India'
  },
  
  // RETURN POLICY - Japan
  {
    category: 'Returns',
    question: 'What is your return policy in Japan?',
    answer: 'We accept returns within 14 days of delivery. Items must be unopened and unused. Refunds are processed within 7 business days. Return shipping costs are covered by us for defective products.',
    region: 'Japan'
  },
  
  // RETURN POLICY - China
  {
    category: 'Returns',
    question: 'What is your return policy in China?',
    answer: 'We accept returns within 7 days per Chinese consumer protection laws. Items must be unused with all accessories. Refunds are processed within 7-15 business days after we receive the returned item.',
    region: 'China'
  },
  
  // SUPPORT HOURS - USA
  {
    category: 'Support',
    question: 'What are your customer support hours in the USA?',
    answer: 'Our US support team is available Monday-Friday 9 AM - 6 PM EST, and Saturday 10 AM - 4 PM EST. You can reach us via live chat, email (support@gamerhub.com), or phone at 1-800-GAMER-HQ.',
    region: 'USA'
  },
  
  // SUPPORT HOURS - India
  {
    category: 'Support',
    question: 'What are your customer support hours in India?',
    answer: 'Our India support team is available Monday-Saturday 10 AM - 7 PM IST. Reach us via live chat, email (support.india@gamerhub.com), or WhatsApp at +91-80-GAMERHUB.',
    region: 'India'
  },
  
  // SUPPORT HOURS - Japan
  {
    category: 'Support',
    question: 'What are your customer support hours in Japan?',
    answer: 'Our Japan support team (日本語対応) is available Monday-Friday 10 AM - 6 PM JST. Contact us via live chat, email (support.jp@gamerhub.com), or phone.',
    region: 'Japan'
  },
  
  // SUPPORT HOURS - China
  {
    category: 'Support',
    question: 'What are your customer support hours in China?',
    answer: 'Our China support team (中文客服) is available Monday-Friday 9 AM - 6 PM CST. Contact us via live chat, email (support.cn@gamerhub.com), or WeChat.',
    region: 'China'
  },
  
  // PAYMENT METHODS - USA
  {
    category: 'Payment',
    question: 'What payment methods do you accept in the USA?',
    answer: 'We accept Visa, Mastercard, American Express, Discover, PayPal, Apple Pay, Google Pay, and Affirm for installment payments. All transactions are in USD and secured with 256-bit SSL encryption.',
    region: 'USA'
  },
  
  // PAYMENT METHODS - India
  {
    category: 'Payment',
    question: 'What payment methods do you accept in India?',
    answer: 'We accept Credit/Debit Cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), Net Banking, Wallets (Paytm, PhonePe), and Cash on Delivery (COD) for orders under ₹50,000. Payments are in INR via Razorpay.',
    region: 'India'
  },
  
  // PAYMENT METHODS - Japan
  {
    category: 'Payment',
    question: 'What payment methods do you accept in Japan?',
    answer: 'We accept Credit Cards (JCB, Visa, Mastercard), Konbini payments (FamilyMart, 7-Eleven, Lawson), PayPay, and bank transfers. All transactions are in JPY.',
    region: 'Japan'
  },
  
  // PAYMENT METHODS - China
  {
    category: 'Payment',
    question: 'What payment methods do you accept in China?',
    answer: 'We accept Alipay, WeChat Pay, UnionPay, and major credit cards. All transactions are in CNY and comply with Chinese payment regulations.',
    region: 'China'
  },
  
  // PRODUCTS - Global
  {
    category: 'Products',
    question: 'What types of gaming accessories do you sell?',
    answer: 'We sell a wide range of gaming accessories including gaming mice, mechanical keyboards, headsets, controllers (Xbox, PlayStation, Nintendo), gaming chairs, mouse pads, webcams, and RGB lighting. We stock premium brands like Razer, Logitech, SteelSeries, Corsair, HyperX, and more.',
    region: null
  },
  {
    category: 'Products',
    question: 'Do you sell gaming PCs or consoles?',
    answer: 'Currently, we specialize in gaming accessories and peripherals only. We do not sell gaming PCs, laptops, or consoles (PlayStation, Xbox, Nintendo Switch). However, we have all the accessories you need for these platforms!',
    region: null
  },
  {
    category: 'Products',
    question: 'Are your products genuine and authentic?',
    answer: 'Absolutely! We are authorized retailers for all major gaming brands. Every product comes with manufacturer warranty and authenticity guarantee. We never sell counterfeit or grey market products.',
    region: null
  },
  
  // WARRANTY - Global
  {
    category: 'Warranty',
    question: 'What warranty do you provide?',
    answer: 'All products come with manufacturer warranty ranging from 6 months to 3 years depending on the brand and product category. Gaming mice and keyboards typically have 2-year warranties. Gaming chairs have 1-2 year warranties. Check individual product pages for specific warranty details.',
    region: null
  },
  {
    category: 'Warranty',
    question: 'How do I claim warranty?',
    answer: 'Contact our support team with your order number and issue description. For manufacturing defects, we\'ll arrange free replacement or repair. Keep your invoice and original packaging for warranty claims.',
    region: null
  },
  
  // PRODUCT AVAILABILITY
  {
    category: 'Products',
    question: 'Do you have stock of the latest gaming products?',
    answer: 'We regularly update our inventory with the latest releases from top gaming brands. If an item is out of stock, you can sign up for restock notifications on the product page. Most popular items are restocked within 1-2 weeks.',
    region: null
  },
  {
    category: 'Products',
    question: 'Can I pre-order upcoming gaming accessories?',
    answer: 'Yes! We offer pre-orders for highly anticipated gaming products. Pre-order items are shipped on release day. You won\'t be charged until the item ships.',
    region: null
  },
  
  // DISCOUNTS AND OFFERS
  {
    category: 'Offers',
    question: 'Do you offer discounts or promotional codes?',
    answer: 'Yes! We run regular promotions and sales events. Sign up for our newsletter to receive exclusive discount codes. We also offer student discounts (10% off) and loyalty rewards for repeat customers.',
    region: null
  },
  
  // TRACKING AND DELIVERY
  {
    category: 'Shipping',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email and SMS. You can track your package in real-time using the tracking link provided. You can also check order status in your account dashboard.',
    region: null
  },
  {
    category: 'Shipping',
    question: 'What if my package is delayed or lost?',
    answer: 'If your package is delayed beyond the estimated delivery date, contact our support team. We\'ll track the shipment with the carrier. For lost packages, we\'ll file a claim and send a replacement or refund within 5-7 business days.',
    region: null
  },
];

async function seedFAQs() {
  console.log('🌱 Starting FAQ seeding...');
  
  try {
    // Clear existing FAQ data
    await pool.query('DELETE FROM faq_knowledge');
    console.log('🗑️  Cleared existing FAQ data');
    
    // Insert FAQ data
    for (const faq of faqData) {
      await pool.query(
        'INSERT INTO faq_knowledge (category, question, answer, region) VALUES ($1, $2, $3, $4)',
        [faq.category, faq.question, faq.answer, faq.region]
      );
    }
    
    console.log(`✅ Inserted ${faqData.length} FAQ entries`);
    
    // Show summary by category and region
    const summary = await pool.query(`
      SELECT 
        category,
        region,
        COUNT(*) as count
      FROM faq_knowledge
      GROUP BY category, region
      ORDER BY category, region NULLS LAST;
    `);
    
    console.log('\n📊 FAQ Summary:');
    console.log('━'.repeat(60));
    summary.rows.forEach(row => {
      const regionStr = row.region || 'Global';
      console.log(`  ${row.category.padEnd(15)} | ${regionStr.padEnd(10)} | ${row.count} FAQs`);
    });
    console.log('━'.repeat(60));
    
    const total = await pool.query('SELECT COUNT(*) FROM faq_knowledge');
    console.log(`\n🎉 Total FAQs: ${total.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedFAQs();
