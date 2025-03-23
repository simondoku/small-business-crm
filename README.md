# Business CRM System

A comprehensive Customer Relationship Management system for small businesses. This application allows you to manage customers, products, and sales with a clean, intuitive interface.

## Features

- **Dashboard**: Get an overview of your business with key metrics and visualizations
- **Customer Management**: Add, edit, and track customer information
- **Product Management**: Manage your product catalog with inventory tracking
- **Sales Management**: Create sales transactions and link them to customers
- **User Authentication**: Secure login with admin and staff roles
- **Data Analysis**: View sales trends and top products

## Technology Stack

- **Frontend**: React, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or cloud instance)

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/small-business-crm.git
cd small-business-crm
```

2. **Install dependencies for both frontend and backend**

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

3. **Create environment variables**

Create a `.env` file in the backend directory with the following variables:

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/small-business-crm
JWT_SECRET=your_jwt_secret_here
```

Note: Replace `your_jwt_secret_here` with a secure random string.

## Running the Application

1. **Start the MongoDB service**

```bash
# For macOS users with Homebrew
brew services start mongodb-community

# For Windows users
# MongoDB should be running as a service, or you can start it manually
```

2. **Start the backend server**

```bash
cd backend
npm run dev
```

This will start the backend server on port 5001 (or your specified port in the .env file).

3. **Start the frontend development server**

```bash
# Open a new terminal and run
npm start
```

This will start the React development server, typically on port 3000.

4. **Create an admin user**

For first-time setup, you'll need to create an admin user. Run the provided script:

```bash
cd backend
node scripts/createAdmin.js
```

This will create an admin user with the following credentials:
- Email: admin@example.com
- Password: admin123

5. **Access the application**

Open your browser and navigate to `http://localhost:3000`

You can now log in with the admin credentials created in the previous step.

## Usage

### Dashboard

The dashboard provides an overview of your business with:
- Sales metrics
- Top-selling products
- Recent transactions
- Sales trends

### Products

Manage your product catalog:
- Add new products with name, price, and stock quantities
- Edit existing products
- Remove products from your inventory

### Customers

Maintain your customer database:
- Add customer contact information
- View purchase history
- Track total purchases and customer value

### Sales

Record sales transactions:
- Select products from your catalog
- Add quantities
- Link to existing customers or add new ones
- Complete sales with automatic timestamps

## Troubleshooting

### Connection Issues

If you encounter MongoDB connection errors, make sure:
- MongoDB service is running
- Your MONGO_URI in the .env file is correct
- Your network allows connections to the database

### Authentication Issues

If you encounter "secretOrPrivateKey must have a value" errors:
- Check that your JWT_SECRET is correctly set in the .env file
- Ensure the .env file is in the correct location (in the backend directory)
- Restart the backend server after making changes to environment variables

## License

[MIT](LICENSE)

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

Feel free to contact me at simondoku9@gmail.com if you have any questions or feedback!
Made with ❤️ Simon Doku
