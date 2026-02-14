# Banking System API

A secure and scalable banking system backend built with Node.js, Express, and MongoDB. This system handles user accounts, transactions, and ledger management with proper authentication and email notifications.

## Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Account Management**: Create and manage multiple bank accounts per user
- **Transaction Processing**: Handle money transfers between accounts with ACID properties
- **Ledger System**: Double-entry bookkeeping for accurate balance tracking
- **Idempotency**: Prevent duplicate transactions using idempotency keys
- **Email Notifications**: Automated emails for registration and transactions
- **System Accounts**: Special accounts for initial fund deposits
- **Token Blacklisting**: Secure logout with token invalidation

## Technologies Used

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling tool

### Authentication & Security
- **JWT (jsonwebtoken)**: Token-based authentication
- **bcryptjs**: Password hashing
- **cookie-parser**: Cookie parsing middleware

### Email Service
- **Nodemailer**: Email sending with OAuth2 support
- **Gmail API**: Email delivery through Gmail

### Environment Management
- **dotenv**: Environment variable management

## Project Structure

```
banking/
├── src/
│   ├── config/
│   │   └── db.js                 # Database connection
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   ├── account.controller.js # Account management
│   │   └── transaction.controller.js # Transaction processing
│   ├── middleware/
│   │   └── auth.middleware.js    # Authentication middleware
│   ├── models/
│   │   ├── user.model.js         # User schema
│   │   ├── account.model.js      # Account schema
│   │   ├── transaction.model.js  # Transaction schema
│   │   ├── ledger.model.js       # Ledger schema
│   │   └── blacklist.model.js    # Token blacklist schema
│   ├── routes/
│   │   ├── auth.routes.js        # Authentication routes
│   │   ├── account.routes.js     # Account routes
│   │   └── transaction.routes.js # Transaction routes
│   ├── services/
│   │   └── email.service.js      # Email service
│   └── app.js                    # Express app configuration
├── server.js                     # Server entry point
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```


`.env` file in the root directory
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/banking
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires authentication)

### Accounts
- `POST /api/account` - Create a new account (requires authentication)
- `GET /api/account` - Get all accounts for logged-in user (requires authentication)

### Transactions
- `POST /api/transaction` - Create a transaction between accounts (requires authentication)
- `POST /api/transaction/system/initial-funds` - Add initial funds to an account (requires system user authentication)

## Key Features Explained

### Transaction Processing
- Uses MongoDB sessions for ACID transactions
- Implements double-entry bookkeeping (debit and credit ledger entries)
- Validates account status and balance before processing
- Updates transaction status from PENDING to SUCCESS
- Sends email notifications to both parties

### Idempotency
- Each transaction requires a unique idempotency key
- Prevents duplicate transactions if the same key is used
- Returns appropriate status for existing transactions (SUCCESS, PENDING, FAILED, REVERSED)

### Account Balance Calculation
- Balances are calculated dynamically from ledger entries
- Uses MongoDB aggregation pipeline
- Formula: Balance = Total Credits - Total Debits

### Security
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Token blacklisting on logout
- System user role for privileged operations

## Database Schema

### User
- email (unique)
- name
- password (hashed)
- systemUser (boolean)

### Account
- userId (reference to User)
- status (ACTIVE, FROZEN, CLOSED)
- currency
- systemUser (boolean)

### Transaction
- fromAccount (reference to Account)
- toAccount (reference to Account)
- amount
- status (PENDING, SUCCESS, FAILED, REVERSED)
- idempotencyKey (unique)

### Ledger
- account (reference to Account)
- transaction (reference to Transaction)
- amount
- type (DEBIT, CREDIT)

