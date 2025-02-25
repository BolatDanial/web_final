# Grand Library 📚

Grand Library is a web application that allows users to browse, borrow, and manage books. It also includes an admin dashboard for managing users and books.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [License](#license)

## Features

- User registration and authentication
- Browse and borrow books
- User profile management
- Admin dashboard for managing users and books
- Responsive design

## Installation

1. Clone the repository:

    ```sh
    git clone https://github.com/yourusername/grand-library.git
    cd grand-library
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/0) file in the root directory and add the following environment variables:

    ```env
    MONGO_URI=your_mongodb_connection_string
    SESSION_SECRET=your_session_secret
    ```

4. Start the server:

    ```sh
    npm start
    ```

5. Open your browser and navigate to `http://localhost:3000`.

## Usage

- Register a new account or log in with an existing account.
- Browse the available books and borrow them.
- Manage your profile and view borrowed books in the dashboard.
- Admins can manage users and books through the admin dashboard.


## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS
- Multer
- bcryptjs
- express-validator
- express-session
- connect-mongo

## License

This project is licensed under the MIT License.