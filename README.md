# NexStore - Basic E-Commerce Store

A sleek, responsive, and basic full-stack e-commerce store built as part of the CodeAlpha Internship task.

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Task](https://img.shields.io/badge/Task-1-blue)

## ✨ Features
* **Interactive Frontend**: Modern, dark-themed UI built with Vanilla HTML, CSS, and JS.
* **Product Catalog**: Dynamic product listings fetched from the backend.
* **Shopping Cart**: Add products, adjust quantities, and see real-time subtotals (uses Local Storage).
* **User Authentication**: Secure Login & Registration using JWT (JSON Web Tokens) and bcrypt password hashing.
* **Order Processing**: Authenticated checkout system that saves order details.
* **Order History**: Users can view their previous orders and total amounts.

## 🛠️ Technology Stack
* **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
* **Backend**: Node.js, Express.js
* **Database**: SQLite3 (Self-contained, serverless)
* **Authentication**: `jsonwebtoken`, `bcryptjs`

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/d24it153/CODEAPLHA-TASK-1.git
   cd CODEAPLHA-TASK-1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

*Note: The SQLite database (`database.sqlite`) will be automatically generated with dummy products upon the first run.*

## 📁 Project Structure
```text
├── public/                 # Static frontend files
│   ├── css/
│   │   └── style.css       # Main stylesheet
│   ├── js/
│   │   └── app.js          # Core frontend logic & API calls
│   ├── index.html          # Product listing page
│   ├── product.html        # Product details page
│   ├── cart.html           # Shopping cart
│   ├── login.html          # User login
│   ├── register.html       # User registration
│   └── orders.html         # Order history
├── database.js             # SQLite Database initialization
├── server.js               # Express API and web server
└── package.json            # App configuration and dependencies
```

## 📝 License
This project is open-source and available for educational purposes.
