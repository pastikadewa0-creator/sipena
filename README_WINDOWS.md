# Running HR-Pro on Windows (XAMPP / Laragon)

This project has been completely migrated to **Laravel (PHP)** and **MySQL**, using basic HTML and CSS, specifically configured for easy local development on Windows.

## Prerequisites
1. Install **XAMPP** (or **WAMP**, **Laragon**).
2. Install **Composer** for Windows (https://getcomposer.org/).
3. Make sure the `php` command is available in your command prompt.

## Setup Instructions

1. **Copy the Folder**:
   - Move this entire `hr-pro` folder into your XAMPP `htdocs` directory (e.g., `C:\xampp\htdocs\hr-pro`).
   
2. **Start MySQL and Apache**:
   - Open XAMPP Control Panel.
   - Start **Apache** and **MySQL**.
   - Open phpMyAdmin (`http://localhost/phpmyadmin`) and create a new empty database named `hr_pro`.

3. **Install Dependencies**:
   - Open your command prompt (CMD or PowerShell) and navigate to the project directory:
     ```bash
     cd C:\xampp\htdocs\hr-pro
     ```
   - Run Composer to install PHP dependencies:
     ```bash
     composer install
     ```

4. **Environment Configuration**:
   - Copy the `.env.example` file and rename it to `.env`.
   - Update the database credentials in `.env` to match your XAMPP setup:
     ```env
     DB_CONNECTION=mysql
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_DATABASE=hr_pro
     DB_USERNAME=root
     DB_PASSWORD=
     ```

5. **Generate App Key**:
   - Run the following command to generate your Laravel application key:
     ```bash
     php artisan key:generate
     ```

6. **Run Migrations (Create Tables)**:
   - Create all the necessary tables in your database by running:
     ```bash
     php artisan migrate
     ```

7. **Create a Test User (Optional)**:
   - You can quickly create an admin user using Laravel Tinker:
     ```bash
     php artisan tinker
     ```
   - Inside Tinker, type:
     ```php
     App\Models\User::create(['username' => 'admin', 'name' => 'Admin User', 'email' => 'admin@example.com', 'password' => bcrypt('password'), 'role' => 'admin']);
     exit;
     ```

8. **Start the Application**:
   - You can serve the application using PHP's built-in server:
     ```bash
     php artisan serve
     ```
   - Open your browser and go to `http://localhost:8000`.
   - Log in using `username`: `admin` and `password`: `password`.
