import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en'; // Only English now

interface Translations {
  [key: string]: string;
}

// Simplified to English-only translations
export const translations: Translations = {
  // Nav
  home: 'Home',
  products: 'Products',
  about: 'About Us',
  contact: 'Contact',
  login: 'Login',
  logout: 'Logout',
  admin: 'Admin',
  cart: 'Cart',
  
  // Hero
  heroTitle: 'Decorate Your Dream Home',
  heroSubtitle: 'Make your home more attractive with the best quality modern furniture.',
  shopNow: 'Shop Now',
  
  // Products
  featuredProducts: 'Featured Products',
  allProducts: 'All Products',
  price: 'Price',
  addToCart: 'Add to Cart',
  viewDetails: 'View Details',
  category: 'Category',
  search: 'Search...',
  
  // Cart
  yourCart: 'Your Cart',
  emptyCart: 'Your cart is empty',
  total: 'Total',
  checkout: 'Checkout',
  quantity: 'Quantity',
  remove: 'Remove',
  
  // Checkout
  checkoutTitle: 'Complete Order',
  fullName: 'Full Name',
  phone: 'Phone Number',
  address: 'Address',
  placeOrder: 'Place Order',
  orderSuccess: 'Your order has been placed successfully!',
  
  // Admin
  dashboard: 'Dashboard',
  manageProducts: 'Manage Products',
  manageOrders: 'Manage Orders',
  addProduct: 'Add New Product',
  productName: 'Product Name',
  productPrice: 'Product Price',
  productImage: 'Product Image',
  actions: 'Actions',
  status: 'Status',
  
  // Common
  taka: '$',
};

interface LanguageContextType {
  language: Language;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language: Language = 'en'; // Fixed to English

  const t = (key: string) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}