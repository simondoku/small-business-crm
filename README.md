# Business CRM System

A comprehensive Customer Relationship Management system for small businesses. This application allows you to manage customers, products, and sales with a clean, intuitive interface.

## Features

- **Dashboard**: Get an overview of your business with key metrics and visualizations
- **Customer Management**: Add, edit, and track customer information
- **Product Management**: Manage your product catalog with inventory tracking
- **Sales Management**: Create sales transactions and link them to customers
- **User Authentication**: Secure login with admin and staff roles
- **Data Analysis**: View sales trends and top products
- **Category Management**: Organize products by categories for better inventory control
- **Advanced Analytics**: Visualize sales activity with heatmaps and detailed reports
- **Focus Mode**: Streamlined interface for faster sales processing
- **Subscription Plans**: Free and Premium tiers with different feature sets
- **Admin Controls**: Reset dashboard data and manage user access
- **Payment Methods**: Support for both cash and card transactions
- **Stock Warnings**: Get alerts for low or insufficient inventory

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

## Deploying to Vercel

This application is configured for seamless deployment on Vercel. Follow these steps to deploy:

### Prerequisites

1. Create a [Vercel account](https://vercel.com/signup) if you don't have one
2. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```
3. Set up a MongoDB database (MongoDB Atlas recommended for production)

### Deployment Steps

1. **Configure Environment Variables**
   
   Before deploying, update the `.env.local` file with your actual MongoDB connection string and JWT secret. These environment variables will be imported during deployment.

2. **Login to Vercel CLI**
   ```
   vercel login
   ```

3. **Deploy the Application**
   
   From the project root directory:
   ```
   vercel
   ```
   
   During the interactive setup:
   - Confirm the project settings
   - Select your team/account
   - When asked about environment variables, select "yes" to import from .env.local

4. **Production Deployment**
   
   After testing your deployment, deploy to production:
   ```
   vercel --prod
   ```

### Vercel Dashboard Configuration

Fine-tune your deployment using the Vercel dashboard:

1. **Domain Settings**: Add a custom domain if needed
2. **Environment Variables**: Add or modify variables in the project settings
3. **Edge Network**: Enable caching rules for optimal performance
4. **Serverless Functions**: Monitor API performance and logs

### Continuous Deployment

The project is set up for continuous deployment:

1. Connect your GitHub/GitLab/Bitbucket repository to Vercel
2. Each push to the main branch will trigger automatic deployment
3. Preview deployments are created for pull requests

## Project Structure and Operation

With Vercel deployment, the application works as follows:

- **Frontend**: The React SPA is served as static files from Vercel's global CDN
- **API**: Backend endpoints run as serverless functions under `/api/*` routes
- **Database**: MongoDB Atlas (or your chosen provider) handles data persistence
- **Authentication**: JWT-based auth works seamlessly with serverless functions

## Optimized For Production

This deployment includes production optimizations:

- Code splitting and lazy loading
- Asset compression
- API response caching
- Error boundaries for resilience
- Environment-specific configuration

## Usage

### Dashboard

The dashboard provides an overview of your business with:
- Sales metrics (revenue, transactions, average sale, new customers)
- Top-selling products with quantity tracking
- Recent transactions with customer details
- Sales trends visualized by day, week, month and year
- Admin controls for system management

### Products

Manage your product catalog:
- Add new products with name, price, and stock quantities
- Organize products using categories for better inventory management
- Edit existing products
- Track stock levels with automatic warnings for low inventory
- Filter products by category for easier navigation

### Customers

Maintain your customer database:
- Add customer contact information
- View purchase history
- Track total purchases and customer value
- Quick add customers during sales process

### Sales

Record sales transactions:
- Select products from your catalog with real-time stock checking
- Add quantities with automatic inventory management
- Use Focus Mode for streamlined checkout experiences
- Link to existing customers or add new ones during checkout
- Support for both cash and card payment methods
- Add transaction notes and comments
- Receive alerts for low stock during sales process

### Reports

Generate detailed business reports:
- Sales activity heatmaps showing transaction patterns
- Monthly revenue trends and performance metrics
- Sales breakdowns by product category
- Customer purchase analysis
- Export reports to PDF or Excel format

### Advanced Analytics

Gain insights with visual analytics:
- Sales activity heatmaps showing patterns over time
- Category distribution analysis
- Monthly trend analysis
- Performance comparisons across time periods

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
