# N_cart - Full-Stack eCommerce Application

A modern, lightweight full-stack eCommerce application engineered for evaluating and practicing AI-powered code review and testing tools such as **CodeRabbit** and **Qodo (formerly CodiumAI)**.

Built on a robust **Node.js + Express.js** backend with atomic local JSON storage and an interactive **Bootstrap 5 + Vanilla JavaScript** frontend.

---

## 1. Project Overview

N_cart was transformed from a static eCommerce template into a full-stack web application featuring dynamic product discovery, search, multi-attribute filtering, interactive shopping cart drawer, persistent wishlist, quick product preview modals, single-page mock checkout, and contact inquiries.

### Key Objectives
- **Realistic Full-Stack Architecture**: Demonstrates clean separation of concerns (routes, controllers, services, middleware, validators, utils, data storage).
- **Zero Heavy Infrastructure**: Runs entirely on local Node.js with atomic JSON file persistence—no MongoDB, PostgreSQL, Docker, or external databases required.
- **Rich Testing Surface**: Tailored to showcase the capabilities of automated code review (CodeRabbit) and test generation (Qodo) across unit, integration, security, edge-case, and end-to-end (E2E) testing dimensions.
- **Preserved Design Identity**: Retains the original brand aesthetic while boosting responsiveness, micro-animations, skeleton shimmers, and toast notifications.

---

## 2. Technology Stack

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (v4.19)
- **Security**: Helmet (CSP, XSS, headers protection), CORS, Express Rate Limiter
- **Data Persistence**: Safe Atomic JSON File Storage with collection whitelisting and path traversal defense
- **Logging**: Structured, level-based logger (`DEBUG`, `INFO`, `WARN`, `ERROR`)
- **Validation**: Strict schema-based input validator middleware

### Frontend
- **Markup**: Semantic HTML5 with SEO meta tags
- **Styling**: Bootstrap 5 + Custom Modern CSS (glassmorphism, shimmer loaders, sliding drawers, toasts)
- **Logic**: Vanilla JavaScript (ES6+ modular controllers, asynchronous API client, race-condition mitigation)
- **Icons**: FontAwesome 5 Free

### Testing Frameworks
- **Backend Unit & Integration**: Jest + Supertest (10 test suites, 62 automated tests)
- **End-to-End (E2E) Browser Testing**: Playwright (6 end-to-end user workflows)

---

## 3. Project Structure

```text
N_cart2/
├── assets/                          # Frontend static assets
│   ├── css/
│   │   ├── bootstrap.min.css        # Base Bootstrap 5 framework
│   │   ├── templatemo.css           # Template branding & layouts
│   │   └── custom.css               # Modern drawers, toasts, skeletons & animations
│   ├── js/
│   │   ├── bootstrap.bundle.min.js  # Bootstrap JavaScript
│   │   ├── jquery-1.11.0.min.js     # Legacy support
│   │   └── custom.js                # Full-stack frontend controller & API client
│   └── img/                         # Product merchandise & category photography
├── backend/                         # Express.js REST API Backend
│   ├── src/
│   │   ├── config/                  # Environment variables & business constants
│   │   ├── controllers/             # Express request & response controllers
│   │   ├── data/                    # JSON collections (products, cart, wishlist, orders, contacts)
│   │   ├── middleware/              # Error handling, rate limiters, request loggers
│   │   ├── routes/                  # Modular API routers
│   │   ├── services/                # Business logic & collection managers
│   │   ├── utils/                   # Calculations, atomic file storage, API responses, logger
│   │   ├── validators/              # Payload validation rules
│   │   ├── app.js                   # Express app configuration & static server
│   │   └── server.js                # Server listener entry point
│   ├── tests/                       # Jest & Supertest automated test suites
│   │   ├── integration/             # API endpoint integration tests
│   │   └── unit/                    # Financial calculations & file security unit tests
│   ├── .env                         # Backend environment variables
│   ├── .env.example                 # Example configuration
│   └── package.json                 # Backend dependencies & test scripts
├── tests/
│   └── e2e/                         # Playwright End-to-End browser test suite
│       └── shop-workflow.spec.js    # Multi-step customer browser journey
├── index.html                       # Home page (Hero, Featured Categories & Products)
├── shop.html                        # Product catalog (Filtering, Sorting, Search, Pagination)
├── shop-single.html                 # Single product details (Image gallery, Size selector)
├── about.html                       # About us & brand story
├── contact.html                     # Contact inquiry page with real-time feedback
├── playwright.config.js             # Playwright browser testing configuration
├── package.json                     # Root orchestrator scripts
└── README.md                        # Documentation
```

---

## 4. Setup & Installation

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm** (v9.0.0 or higher)

### Installation Steps

1. **Clone or Navigate to the Repository**:
   ```bash
   cd N_cart2
   ```

2. **Install Root & Backend Dependencies**:
   ```bash
   npm install
   npm --prefix backend install
   ```

3. **Install Playwright Browsers (for E2E Testing)**:
   ```bash
   npx playwright install chromium
   ```

4. **Environment Variables Configuration**:
   The backend includes a pre-configured `.env` file in `backend/.env`. You can customize it as needed:

   | Variable | Default Value | Description |
   | :--- | :--- | :--- |
   | `PORT` | `5000` | Port on which the Express server listens |
   | `NODE_ENV` | `development` | Runtime environment (`development`, `test`, `production`) |
   | `DATA_DIR` | `./src/data` | Relative or absolute path to JSON storage directory |
   | `CORS_ORIGIN` | `*` | Allowed CORS origins |
   | `LOG_LEVEL` | `info` | Minimum log level (`debug`, `info`, `warn`, `error`) |
   | `RATE_LIMIT_WINDOW_MS` | `900000` | Rate limiting sliding window in ms (15 minutes) |
   | `RATE_LIMIT_MAX` | `100` | Maximum requests per IP window |

---

## 5. Starting the Application

### Development Mode (with Live Reloading)
```bash
npm run dev
```

### Production / Standard Mode
```bash
npm start
```

Once started, open your web browser at:
```text
http://localhost:5000
```
The server serves both the **REST API** (`/api/*`) and the **frontend web pages** (`index.html`, `shop.html`, etc.) simultaneously.

---

## 6. REST API Endpoint Documentation

All endpoints return a standardized, uniform response contract:
```json
{
  "success": true,
  "message": "Operation description",
  "data": { ... },
  "meta": { "total": 14, "page": 1 }
}
```

### A. Health & Diagnostics
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service uptime, memory usage, environment, and status | `200` |

### B. Product Management
| Method | Endpoint | Query Parameters | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | `category`, `q`, `sort`, `page`, `limit` | Paginated product list with search & sorting | `200` |
| `GET` | `/api/products/featured` | None | Featured products for home page display | `200` |
| `GET` | `/api/products/:id` | None | Retrieve single product details | `200`, `404` |
| `POST` | `/api/products` | Body: `{ name, price, category, ... }` | Create a new product (validated) | `201`, `400` |
| `PUT` | `/api/products/:id` | Body: `{ price, stock, ... }` | Update product attributes | `200`, `400`, `404` |
| `DELETE` | `/api/products/:id` | None | Delete product by ID | `200`, `404` |

### C. Category Management
| Method | Endpoint | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | List all product categories | `200` |
| `GET` | `/api/categories/:id` | Get category details by ID or slug | `200`, `404` |
| `GET` | `/api/categories/:id/products` | Fetch all products belonging to a category | `200`, `404` |
| `POST` | `/api/categories` | Add a new category (duplicate slug rejection) | `201`, `400`, `409` |
| `DELETE` | `/api/categories/:id` | Remove category | `200`, `404` |

### D. Shopping Cart
| Method | Endpoint | Body Payload | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | None | Retrieve cart with calculated subtotal, 8% tax, shipping & total | `200` |
| `POST` | `/api/cart` | `{ "productId": "prod-001", "quantity": 2, "size": "M" }` | Add item or increment existing item | `200`, `400`, `404` |
| `PUT` | `/api/cart/items/:id` | `{ "quantity": 3, "size": "M" }` | Update item quantity (0 removes item) | `200`, `400`, `404` |
| `DELETE` | `/api/cart/items/:id` | Query: `?size=M` (optional) | Remove specific item from cart | `200`, `404` |
| `DELETE` | `/api/cart` | None | Clear entire shopping cart | `200` |

### E. Wishlist
| Method | Endpoint | Body Payload | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/wishlist` | None | Fetch all wishlisted items | `200` |
| `POST` | `/api/wishlist` | `{ "productId": "prod-002" }` | Add item to wishlist (prevents duplicates) | `201`, `400`, `409` |
| `DELETE` | `/api/wishlist/:id` | None | Remove item from wishlist by product ID | `200`, `404` |
| `DELETE` | `/api/wishlist` | None | Clear entire wishlist | `200` |

### F. Orders & Checkout
| Method | Endpoint | Body Payload | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Customer details, payment method, optional custom items | Place order, generates `ORD-YYYYMMDD-XXXX` ID | `201`, `400` |
| `GET` | `/api/orders` | Query: `?limit=10&page=1` | List all past orders | `200` |
| `GET` | `/api/orders/:id` | None | Retrieve single order details by ID or order number | `200`, `404` |
| `PATCH` | `/api/orders/:id/status` | `{ "status": "processing" }` | Controlled status update (`pending` &rarr; `processing` &rarr; `shipped` &rarr; `delivered`) | `200`, `400`, `404` |

### G. Customer Inquiries (Contact)
| Method | Endpoint | Body Payload | Description | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | `{ "name": "...", "email": "...", "subject": "...", "message": "..." }` | Submit customer message with validation and rate limiting | `201`, `400` |
| `GET` | `/api/contact` | None | List submitted contact messages | `200` |

---

## 7. Testing Suite Execution

The repository is equipped with both **backend automated tests** (Jest + Supertest) and **end-to-end browser tests** (Playwright).

### Run All Backend Unit & Integration Tests
```bash
npm test
```
*Outputs: 10 test suites, 62 unit & integration tests.*

### Run Backend Unit Tests Only
```bash
npm run test:unit
```
*Covers: Pricing and tax calculations, atomic file security and path traversal defense, request input validators.*

### Run Backend API Integration Tests Only
```bash
npm run test:integration
```
*Covers: Health check, security headers, malformed JSON handling, product catalog, categories, cart totals, wishlist duplicate rejection, order transitions, and contact form submission.*

### Run End-to-End (E2E) Browser Tests
```bash
npm run test:e2e
```
*Executes all 6 browser customer scenarios in headless Chromium.*

### Run the Entire Test Suite (Backend + Browser E2E)
```bash
npm run test:all
```

---

## 8. CodeRabbit and Qodo Testing Scenarios

This codebase is deliberately structured to serve as an evaluation ground for AI code review and automated test generation tools. Below is a guide to testing each category:

| Testing Category | Implemented Feature in N_cart | Evaluation Scenario for CodeRabbit & Qodo |
| :--- | :--- | :--- |
| **Code Review** | Modular Express structure (`controllers`, `services`, `middleware`, `utils`, `validators`) | Ask tool to review architecture, separation of concerns, and REST compliance. |
| **Bug Detection** | Financial rounding (`roundCurrency`), discount cap logic, and async state synchronization | Test if the tool detects edge-case rounding inaccuracies, unhandled promise rejections, or race conditions. |
| **Code Quality** | Consistent naming, modular controllers, reusable helper functions | Assess maintainability index, cyclomatic complexity, and code duplication analysis. |
| **Security Testing** | Atomic file writes with `.temp` renaming, collection whitelisting (`ALLOWED_COLLECTIONS`), path traversal prevention (`../`), Helmet CSP headers, rate limiting | Prompt the tool to perform a SAST security audit on `fileStorage.js` and Express security middleware. |
| **API Testing** | Centralized `ApiResponse` standard contract, uniform error codes, HTTP status codes (200, 201, 400, 404, 409, 429) | Ask Qodo to generate regression tests for all endpoints and status codes. |
| **Functional Testing** | Full shopping journey: browse catalog &rarr; filter category &rarr; sort price &rarr; quick view &rarr; add to cart &rarr; modify quantity &rarr; place order | Evaluate E2E test generation for user checkout and inventory decrement flows. |
| **Unit Testing** | `calculations.js`, `validators/*.js`, `fileStorage.js` | Test Qodo's ability to create boundary tests (e.g. subtotal = $149.99 vs $150.00 for free shipping). |
| **Integration Testing** | Express endpoints communicating with local JSON persistent store | Assess mock and integration test creation with Supertest. |
| **Edge-Case Testing** | Negative quantities, unknown product IDs, empty cart checkout, duplicate wishlist addition, malformed JSON | Evaluate whether the tools detect boundary violations and generate negative test cases. |
| **Performance Testing** | Pagination parameters (`page`, `limit`), rate limiting thresholds, in-memory caching | Prompt tool to analyze time complexity of filters and file I/O operations. |
| **Error Handling** | Centralized `errorHandler` middleware catching 400 SyntaxError for malformed payloads, 404 RouteNotFound | Test if error response payloads conform to the `{ success, message, errors, errorCode }` contract. |
| **Frontend UI/UX Testing** | Offcanvas cart drawer, wishlist drawer, quick view modal, toast alerts, skeleton shimmer loaders | Evaluate Playwright tests for DOM state changes, animations, and accessibility attributes. |

---

## 9. Deployment & Production Guidelines

When deploying N_cart to a staging or production server:
1. **Set Environment Variables**: Set `NODE_ENV=production` and specify a dedicated `PORT`.
2. **Reverse Proxy**: Place Express behind NGINX or Cloudflare to handle SSL/TLS termination and static asset caching.
3. **Storage Scalability**: For single-instance testing and lightweight deployments, atomic JSON storage provides zero-config persistence. For multi-instance clustered environments, replace `fileStorage.js` with Redis or an external relational/document store.
4. **Process Manager**: Use `pm2` or Docker to manage the Node.js process:
   ```bash
   npx pm2 start backend/src/server.js --name n-cart
   ```

---

## 10. Summary of Available Frontend Features

- **Dynamic Catalog Loading**: Automatically fetches live products from the REST API with fallback and skeleton loading.
- **Multi-Category Filtering**: Instant category switching without full page reloads.
- **Smart Sorting**: Sort by price (Low to High, High to Low), name (A-Z, Z-A), and top customer ratings.
- **Interactive Quick View**: Inspect product details, select sizes, and adjust quantities directly inside a modal.
- **Sliding Cart Drawer**: Smooth slide-in drawer displaying line items, unit subtotals, 8% tax calculation, dynamic shipping (free over $150), and grand total.
- **Wishlist Drawer & Dynamic Badges**: Persistent wishlist saving with heart indicator state management and navbar counters.
- **Single-Page Checkout**: Interactive checkout modal validating customer shipping details and generating unique order confirmations.
- **Toast Notifications**: Non-intrusive floating toasts confirming user actions and alerting to validation errors.
