# Beauty Store E-Commerce Backend

A production-ready Node.js/Express backend for an e-commerce store selling beauty products, sunglasses, and accessories.

## Features

- **Authentication**: JWT-based auth with registration, login, password reset
- **User Management**: Profiles, addresses, wishlists
- **Product Catalog**: Full CRUD with variants, reviews, filtering, search
- **Categories**: Nested categories with subcategories
- **Shopping Cart**: Guest and user carts, coupon support, cart merging
- **Orders**: Order management with status tracking
- **Payments**: Stripe integration with webhooks
- **Admin Panel**: User management, order stats, product management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT (jsonwebtoken)
- **Payments**: Stripe
- **Security**: Helmet, bcrypt, CORS

## Quick Start

### 1. Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account (for payments)

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

### 3. Configuration

Edit `.env` with your settings:

```env
MONGODB_URI=mongodb://localhost:27017/beauty-store
JWT_SECRET=your-secure-secret-key
STRIPE_SECRET_KEY=sk_test_xxx
```

### 4. Seed Database

```bash
npm run seed
```

This creates:
- Admin user: `admin@beautystore.com` / `admin123`
- Sample categories and products

### 5. Run the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/update-password` | Update password |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password/:token` | Reset password |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with filters) |
| GET | `/api/products/featured` | Featured products |
| GET | `/api/products/new-arrivals` | New arrivals |
| GET | `/api/products/bestsellers` | Bestsellers |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/products/:id/reviews` | Add review |
| GET | `/api/products/:id/related` | Related products |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories |
| GET | `/api/categories/:id` | Single category |
| GET | `/api/categories/:id/products` | Products in category |
| POST | `/api/categories` | Create category (admin) |
| PUT | `/api/categories/:id` | Update category (admin) |
| DELETE | `/api/categories/:id` | Delete category (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get cart |
| POST | `/api/cart/add` | Add item |
| PUT | `/api/cart/item/:itemId` | Update quantity |
| DELETE | `/api/cart/item/:itemId` | Remove item |
| DELETE | `/api/cart` | Clear cart |
| POST | `/api/cart/coupon` | Apply coupon |
| DELETE | `/api/cart/coupon` | Remove coupon |
| POST | `/api/cart/merge` | Merge guest cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/:id` | Single order |
| GET | `/api/orders/number/:orderNumber` | Order by number |
| POST | `/api/orders` | Create order |
| PUT | `/api/orders/:id/status` | Update status (admin) |
| PUT | `/api/orders/:id/cancel` | Cancel order |
| GET | `/api/orders/admin/stats` | Order stats (admin) |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/payments/confirm` | Confirm payment |
| POST | `/api/payments/webhook` | Stripe webhook |
| POST | `/api/payments/refund` | Process refund (admin) |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/addresses` | Add address |
| PUT | `/api/users/addresses/:id` | Update address |
| DELETE | `/api/users/addresses/:id` | Delete address |
| GET | `/api/users/wishlist` | Get wishlist |
| POST | `/api/users/wishlist/:productId` | Add to wishlist |
| DELETE | `/api/users/wishlist/:productId` | Remove from wishlist |
| GET | `/api/users` | List users (admin) |

## Query Parameters

### Product Filtering
```
GET /api/products?page=1&limit=12&sort=-price&category=xxx&productType=beauty&brand=GlowUp&minPrice=20&maxPrice=100&inStock=true&search=serum
```

## Authentication

Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

For guest carts, include session ID:
```
X-Session-ID: <uuid>
```

## Sample Coupon Codes

- `WELCOME10` - 10% off
- `SAVE20` - $20 off
- `BEAUTY15` - 15% off

## Project Structure

```
ecommerce-backend/
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Cart.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── categories.js
│   ├── cart.js
│   ├── orders.js
│   ├── payments.js
│   └── users.js
├── middleware/
│   └── auth.js
├── scripts/
│   └── seed.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

## License

MIT
