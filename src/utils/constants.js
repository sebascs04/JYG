export const APP_NAME = 'Rápidos y Plumosos';

export const USER_ROLES = {
  CUSTOMER: 'customer',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  CASH: 'cash',
  TRANSFER: 'transfer',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id) => `/products/${id}`,
    SEARCH: '/products/search',
  },
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: (id) => `/orders/${id}`,
    UPDATE: (id) => `/orders/${id}`,
  },
  INVENTORY: {
    LIST: '/inventory',
    UPDATE: (id) => `/inventory/${id}`,
  },
};

export const CATEGORIES = [
  { id: 'pollo', name: 'Pollo' },
  { id: 'cerdo', name: 'Cerdo' },
  { id: 'pavita', name: 'Pavita' },
  { id: 'abarrotes', name: 'Abarrotes' },
];

export const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Pechuga de Pollo',
    description: 'Pechuga de pollo fresca y jugosa',
    price: 18.50,
    category: 'pollo',
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop',
    stock: 50,
  },
  {
    id: '2',
    name: 'Muslos de Pollo',
    description: 'Muslos de pollo tiernos',
    price: 15.00,
    category: 'pollo',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop',
    stock: 40,
  },
  {
    id: '3',
    name: 'Chuletas de Cerdo',
    description: 'Chuletas de cerdo premium',
    price: 22.00,
    category: 'cerdo',
    image: 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=400&h=400&fit=crop',
    stock: 30,
  },
  {
    id: '4',
    name: 'Lomo de Cerdo',
    description: 'Lomo de cerdo seleccionado',
    price: 28.50,
    category: 'cerdo',
    image: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?w=400&h=400&fit=crop',
    stock: 25,
  },
  {
    id: '5',
    name: 'Pechuga de Pavo',
    description: 'Pechuga de pavo magra',
    price: 24.00,
    category: 'pavita',
    image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=400&fit=crop',
    stock: 20,
  },
  {
    id: '6',
    name: 'Pavo Entero',
    description: 'Pavo entero para ocasiones especiales',
    price: 85.00,
    category: 'pavita',
    image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400&h=400&fit=crop',
    stock: 10,
  },
  {
    id: '7',
    name: 'Arroz Integral',
    description: 'Arroz integral 1kg',
    price: 8.50,
    category: 'abarrotes',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop',
    stock: 100,
  },
  {
    id: '8',
    name: 'Aceite de Oliva',
    description: 'Aceite de oliva extra virgen 500ml',
    price: 18.00,
    category: 'abarrotes',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    stock: 60,
  },
  {
    id: '9',
    name: 'Alitas de Pollo',
    description: 'Alitas de pollo marinadas',
    price: 16.50,
    category: 'pollo',
    image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&h=400&fit=crop',
    stock: 45,
  },
  {
    id: '10',
    name: 'Costillas de Cerdo',
    description: 'Costillas de cerdo BBQ',
    price: 32.00,
    category: 'cerdo',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop',
    stock: 20,
  },
];
