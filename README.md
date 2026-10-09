# AMEX Technology — Online Cart & Billing Application

> **Technical Assessment | Junior Developer Role**  
> Built with Next.js (App Router), React 19, TypeScript, PostgreSQL, Prisma ORM, Nodemailer, and TailwindCSS.

---

## 🔗 Project Links & Test Credentials

- **Live Deployed Web App**: `https://your-amex-app.vercel.app` _(Deploy via Vercel + Neon)_
- **GitHub Repository**: `https://github.com/your-username/amex-cart-app`
- **Test Reviewer Credentials**:
  - **Email**: `test@gmail.com`
  - **Password**: `test@123`
  - _(A "Fill Demo Login" button is also provided directly on the login page for 1-click access)_

---

## 📌 Project Overview

This project is a full-stack e-commerce cart and automated billing web application built specifically for the **AMEX Technology Junior Developer Assessment**. It delivers an end-to-end shopping experience—from secure user registration to persistent database-backed cart management, atomic checkout, and instant itemized bill dispatching to the user's registered email address.

### Core Features Implemented:

1. **Authentication & Multi-Tenant Security**:
   - User registration and login with passwords securely hashed using `bcryptjs` (salt rounds = 10, never plain text).
   - Session authentication via secure, HTTP-only JWT cookies (`token`).
   - Route protection on `/dashboard`, `/cart`, and `/order-success/:id`.
   - **Strict tenant isolation**: Each user has their own private cart and orders; users can never view or modify another user's cart.
2. **Product Catalog**:
   - Seeded with at least 8 verified tech products matching the assessment brief (Wireless Mouse @ Rs. 499, USB Keyboard @ Rs. 799, Laptop Stand @ Rs. 1,200, Type-C Hub, HD Webcam, etc.).
   - Common catalog accessible to all authenticated users.
3. **Persistent Cart Management**:
   - Add to cart, increment quantity, decrement quantity, and delete items.
   - Saved directly in PostgreSQL via Prisma `CartItem` relation, persisting across logouts and page refreshes.
   - Clear error prevention for invalid quantities (`<= 0`) and duplicate items.
4. **Billing & Real-Time Calculations**:
   - The cart page itemizes each product with its name, image, unit price, quantity, individual **Line Total** (`price × quantity`), and the calculated **Grand Total**.
5. **Checkout & Email Invoicing (Assessment Core)**:
   - **Atomic Transaction**: Placing an order executes a Prisma `$transaction` that creates the `Order`, generates itemized `OrderItem` records, and clears the user's cart atomically.
   - **Email Dispatch**: Dispatches the official order summary to the user's registered email address.
   - **Exact Layout Matching**: Formats both plain text and responsive HTML versions matching the table in the assessment brief:

     ```
     Subject: Your order summary
     Hi Priya, thanks for your order. Here is your bill:

     Product              Qty   Price       Total
     --------------------------------------------------
     Wireless Mouse       2     Rs. 499     Rs. 998
     USB Keyboard         1     Rs. 799     Rs. 799
     Laptop Stand         1     Rs. 1,200   Rs. 1,200
     --------------------------------------------------
     Grand total                            Rs. 2,997
     ```

   - **Resilience & Fault Tolerance**: Email sending is wrapped in graceful error handling so that if SMTP credentials are missing or network delivery encounters an issue, the order still succeeds and **never crashes the application**.

6. **Order Receipt & Confirmation**:
   - Generates a protected order confirmation invoice at `/order-success/:orderId` showing order reference ID, delivery status, and full itemized bill breakdown.
7. **Comprehensive Validation & Error Handling**:
   - Clear, friendly feedback for: wrong password, duplicate email, empty cart checkout, and invalid quantities.
8. **Modern Responsive Corporate UI**:
   - Sticky AMEX corporate navbar with Centurion branding, live cart item count badge, user profile chip with initials avatar, and mobile responsive drawer menu.

---

## 🗄️ Why PostgreSQL Was Chosen

Per the assessment brief requirements, the database selection is explicitly justified below:

1. **ACID Compliance & Financial Data Integrity**:
   In an e-commerce and billing application, data consistency is paramount. PostgreSQL provides full ACID (Atomicity, Consistency, Isolation, Durability) guarantees. When a user submits an order, three operations must succeed together:
   - Recording the `Order` record.
   - Recording all line items in `OrderItem`.
   - Purging the user's active `CartItem` rows.
     PostgreSQL and Prisma execute this within an atomic database transaction (`prisma.$transaction`). If any step fails, the entire transaction rolls back, preventing double charges, orphaned cart items, or incomplete orders.

2. **Relational Data Modeling & Multi-Tenant Isolation**:
   The domain model exhibits natural one-to-many and many-to-one relationships (`User` ↔ `CartItem` ↔ `Product`, and `User` ↔ `Order` ↔ `OrderItem`). PostgreSQL enforces strict relational integrity with foreign keys and cascade deletions (`onDelete: Cascade`), ensuring that deleting a user or order cleans up child relations cleanly without leaving dangling data.

3. **Composite Unique Constraints**:
   PostgreSQL enforces a composite unique constraint `@@unique([userId, productId])` on the `CartItem` table. This prevents race conditions where rapid clicks could create duplicate cart rows for the same product instead of incrementing quantity.

4. **Production Scalability & Cloud Ecosystem**:
   PostgreSQL has first-class hosting support on serverless platforms like **Neon**, **Supabase**, and **Railway**, offering connection pooling, instant branching, and low-latency deployment alongside Next.js on Vercel.

---

## 🛠️ Tech Stack Architecture

| Layer         | Technology                         | Rationale                                                                      |
| :------------ | :--------------------------------- | :----------------------------------------------------------------------------- |
| **Framework** | Next.js 16 (App Router) + React 19 | Server Components for speed, Server Actions for mutations, SEO optimization    |
| **Language**  | TypeScript 5                       | Strict type-safety across database models, API payloads, and UI components     |
| **Database**  | PostgreSQL                         | Robust ACID compliance, relational integrity, and transaction support          |
| **ORM**       | Prisma 6                           | Type-safe schema definition, migrations, and automated client generation       |
| **Styling**   | TailwindCSS 4                      | Utility-first responsive styling tailored to AMEX corporate brand identity     |
| **Auth**      | bcryptjs + jsonwebtoken            | Cryptographic password hashing and secure HTTP-only cookie sessions            |
| **Email**     | Nodemailer                         | Universal SMTP dispatching, resilient error catching, and HTML/text templating |

---

Create a `.env` file in the root directory (based on [`.env.example`](file:///c:/Users/VIRAJ%20PATEL/OneDrive/Viraj%20Patel/amex-cart-app/.env.example)):

```env
# Database Connection (PostgreSQL / Neon / Supabase)
DATABASE_URL="postgresql://username:password@localhost:5432/amex"

# JWT Secret for Session Cookies
JWT_SECRET="amex-secret-jwt-key-2026-secure"

# Email Configuration (Optional for development; uses console logger if omitted)
# For production or live email delivery, use Gmail SMTP, Mailtrap, Brevo, or Resend
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="\"AMEX Technology Store\" <orders@amexstore.com>"
```

---

## 🚀 Local Setup & Installation

### Prerequisites:

- **Node.js**: v18.18 or higher (v20+ recommended)
- **PostgreSQL**: Local PostgreSQL server or a free cloud database (Neon / Supabase)

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/amex-cart-app.git
cd amex-cart-app
```

### 2. Install dependencies:

```bash
npm install
```

### 3. Configure environment variables:

```bash
cp .env.example .env
# Update DATABASE_URL with your PostgreSQL credentials
```

### 4. Run database migrations & seed:

```bash
# Push Prisma schema to your PostgreSQL database
npx prisma db push

# Seed products and reviewer test account (priya@amex.com / password123)
npm run seed
```

### 5. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Complete Assessment Flow

1. Navigate to `http://localhost:3000/login`.
2. Click **"Fill Demo Login"** to populate `test@gmail.com` and `test@123`, then click **Sign In**.
3. On the **Store Dashboard**, browse the 8 seeded tech products and click **"+ Add to Cart"** on desired items. Notice the instant micro-animation feedback and live cart badge update in the top navbar.
4. Click **"Cart"** in the navbar to visit `/cart`.
5. Adjust quantities (`-` or `+`) or remove items. Notice line totals recalculate dynamically in real time.
6. Click **"Place Order & Send Bill →"**.
7. The order transaction saves to the database, clears the cart, dispatches the email bill, and navigates to `/order-success/:orderId`.
8. Review the completed bill breakdown on the confirmation page.
9. To test tenant isolation: click **Logout**, register a brand new account (e.g. `test@example.com`), and verify that the new user has a completely clean, isolated cart!

---

## 📝 Candidate Reflection & Future Improvements

### What Was Finished:

- Full user registration & login flow with hashed passwords and protected routes.
- Strict tenant isolation where each user's cart is private.
- 8 sample products seeded in PostgreSQL database matching PDF prices.
- Interactive cart operations (add, quantity stepper, remove) with persistent DB storage.
- Bill calculation including item prices, individual line totals, and grand total.
- Order placement with atomic Prisma database transactions.
- Email dispatch with exact table format matching the assessment brief.
- Resilient failure handling preventing crashes on email errors.
- Responsive corporate AMEX interface with sticky navbar, live cart badge, and mobile drawer.

### What Would Be Improved Next:

- **Payment Gateway Integration**: Integrate Stripe or Razorpay for mock card payments before finalizing order transactions.
- **Order History Dashboard**: Add a `/orders` page allowing users to view past historical invoices and order statuses.
- **PDF Invoice Download**: Add a one-click button on the receipt page allowing users to download their bill as a PDF invoice.
- **Product Search & Filtering**: Add live search and category filtering for catalogs with hundreds of products.

---

_Submitted for AMEX Technology Junior Developer Technical Assessment._
