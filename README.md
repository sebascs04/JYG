# Rápidos y Plumosos - Frontend

Grocery e-commerce platform built with React, Vite, and Tailwind CSS.

## Features

- **Public Store**: Product catalog, shopping cart, and checkout
- **Admin Panel**: Order management, inventory control, and dispatch tracking

## Tech Stack

- **Build Tool**: Vite
- **Framework**: React (JavaScript)
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **State Management**: Zustand

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure your API URL:

```bash
cp .env.example .env
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── api/                 # API service layer
├── components/          # Reusable components
│   ├── ui/             # UI components (Button, Input, etc.)
│   ├── layout/         # Layout components (Header, Footer)
│   └── common/         # Common components
├── features/           # Feature modules
│   ├── auth/          # Authentication
│   ├── catalog/       # Product catalog
│   ├── cart/          # Shopping cart
│   ├── checkout/      # Checkout process
│   └── admin/         # Admin panel
├── hooks/             # Custom hooks
├── layouts/           # Page layouts
├── routes/            # Route configuration
├── store/             # Zustand stores
├── utils/             # Utility functions
└── styles/            # Global styles
```

## Available Routes

### Public Routes
- `/` - Home (redirects to catalog)
- `/catalog` - Product catalog
- `/catalog/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Register

### Protected Routes (Admin/Employee)
- `/admin/dashboard` - Admin dashboard
- `/admin/orders` - Order management
- `/admin/inventory` - Inventory control
- `/admin/dispatch` - Dispatch management

## Development

- Follow the feature-based folder structure
- Use Zustand for global state management
- Use React Hook Form for form handling
- Use Tailwind CSS for styling with the `cn()` utility

## License

MIT
