const express = require("express");
const multer = require("multer");
const Book = require("../models/Book");
const User = require("../models/User");
const { isAdmin } = require("../middlewares/auth");

const router = express.Router();

// Multer for file uploads (book covers)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage });


// 📌 Show User Management Page
router.get("/users", isAdmin, async (req, res) => {
    try {
        const users = await User.find();
        res.render("admin-users", { users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.send("Error loading user list");
    }
});

// 📌 Edit User Page
router.get("/users/edit/:id", isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found");
        res.render("edit-user", { user });
    } catch (err) {
        console.error(err);
        res.send("Error fetching user data");
    }
});

// 📌 Handle User Update
router.post("/users/edit/:id", isAdmin, async (req, res) => {
    try {
        const { name, email, role } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send("User not found");

        user.name = name;
        user.email = email;
        user.role = role; // Can change role (user/admin)

        await user.save();
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.send("Error updating user");
    }
});

// 📌 Delete User
router.post("/users/delete/:id", isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        console.error(err);
        res.send("Error deleting user");
    }
});


// 📌 Show Admin Book Management Page
router.get("/books", isAdmin, async (req, res) => {
    const books = await Book.find();
    res.render("admin-books", { books });
});

// 📌 Add New Book (Form Page)
router.get("/books/add", isAdmin, (req, res) => {
    res.render("edit-book", { book: null });
});

// 📌 Handle New Book Submission
router.post("/books/add", isAdmin, upload.single("coverImage"), async (req, res) => {
    try {
        const { title, author, category, availableCopies } = req.body;
        const book = new Book({
            title,
            author,
            category,
            availableCopies,
            coverImage: req.file ? `/uploads/${req.file.filename}` : null
        });
        await book.save();
        res.redirect("/admin/books");
    } catch (err) {
        console.error("Error adding book:", err);
        res.send("Error adding book");
    }
});

// 📌 Edit Book Page
router.get("/books/edit/:id", isAdmin, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send("Book not found");
        res.render("edit-book", { book });
    } catch (err) {
        console.error(err);
        res.send("Error fetching book data");
    }
});

// 📌 Handle Book Update
router.post("/books/edit/:id", isAdmin, upload.single("coverImage"), async (req, res) => {
    try {
        const { title, author, category, availableCopies } = req.body;
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).send("Book not found");

        book.title = title;
        book.author = author;
        book.category = category;
        book.availableCopies = availableCopies;

        if (req.file) {
            book.coverImage = `/uploads/${req.file.filename}`;
        }

        await book.save();
        res.redirect("/admin/books");
    } catch (err) {
        console.error(err);
        res.send("Error updating book");
    }
});

// 📌 Delete Book
router.post("/books/delete/:id", isAdmin, async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.redirect("/admin/books");
    } catch (err) {
        console.error(err);
        res.send("Error deleting book");
    }
});

module.exports = router;
