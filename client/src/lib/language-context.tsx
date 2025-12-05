import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface Translations {
  [key: string]: {
    bn: string;
    en: string;
  };
}

export const translations: Translations = {
  // Nav
  home: { bn: 'হোম', en: 'Home' },
  products: { bn: 'পণ্যসমূহ', en: 'Products' },
  about: { bn: 'আমাদের সম্পর্কে', en: 'About Us' },
  contact: { bn: 'যোগাযোগ', en: 'Contact' },
  login: { bn: 'লগইন', en: 'Login' },
  logout: { bn: 'লগআউট', en: 'Logout' },
  admin: { bn: 'অ্যাডমিন', en: 'Admin' },
  cart: { bn: 'ঝুড়ি', en: 'Cart' },
  
  // Hero
  heroTitle: { bn: 'আপনার স্বপ্নের ঘর সাজান', en: 'Decorate Your Dream Home' },
  heroSubtitle: { bn: 'সেরা মানের আধুনিক আসবাবপত্র দিয়ে আপনার ঘরকে করে তুলুন আরও আকর্ষণীয়।', en: 'Make your home more attractive with the best quality modern furniture.' },
  shopNow: { bn: 'এখনই কিনুন', en: 'Shop Now' },
  
  // Products
  featuredProducts: { bn: 'জনপ্রিয় পণ্য', en: 'Featured Products' },
  allProducts: { bn: 'সকল পণ্য', en: 'All Products' },
  price: { bn: 'দাম', en: 'Price' },
  addToCart: { bn: 'ঝুড়িতে যোগ করুন', en: 'Add to Cart' },
  viewDetails: { bn: 'বিস্তারিত দেখুন', en: 'View Details' },
  category: { bn: 'ক্যাটাগরি', en: 'Category' },
  search: { bn: 'অনুসন্ধান করুন...', en: 'Search...' },
  
  // Cart
  yourCart: { bn: 'আপনার ঝুড়ি', en: 'Your Cart' },
  emptyCart: { bn: 'আপনার ঝুড়ি খালি', en: 'Your cart is empty' },
  total: { bn: 'সর্বমোট', en: 'Total' },
  checkout: { bn: 'চেকআউট', en: 'Checkout' },
  quantity: { bn: 'পরিমাণ', en: 'Quantity' },
  remove: { bn: 'সরান', en: 'Remove' },
  
  // Checkout
  checkoutTitle: { bn: 'অর্ডার সম্পন্ন করুন', en: 'Complete Order' },
  fullName: { bn: 'পুরো নাম', en: 'Full Name' },
  phone: { bn: 'মোবাইল নম্বর', en: 'Phone Number' },
  address: { bn: 'ঠিকানা', en: 'Address' },
  placeOrder: { bn: 'অর্ডার নিশ্চিত করুন', en: 'Place Order' },
  orderSuccess: { bn: 'আপনার অর্ডার সফল হয়েছে!', en: 'Your order has been placed successfully!' },
  
  // Admin
  dashboard: { bn: 'ড্যাশবোর্ড', en: 'Dashboard' },
  manageProducts: { bn: 'পণ্য ব্যবস্থাপনা', en: 'Manage Products' },
  manageOrders: { bn: 'অর্ডার ব্যবস্থাপনা', en: 'Manage Orders' },
  addProduct: { bn: 'নতুন পণ্য যোগ করুন', en: 'Add New Product' },
  productName: { bn: 'পণ্যের নাম', en: 'Product Name' },
  productPrice: { bn: 'পণ্যের দাম', en: 'Product Price' },
  productImage: { bn: 'পণ্যের ছবি', en: 'Product Image' },
  actions: { bn: 'অ্যাকশন', en: 'Actions' },
  status: { bn: 'অবস্থা', en: 'Status' },
  
  // Common
  taka: { bn: '৳', en: '৳' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('bn');

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
