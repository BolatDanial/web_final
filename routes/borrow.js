const express = require('express');
const router = express.Router();
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { ensureAuthenticated } = require('../middlewares/auth'); // Ensure login

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) return res.redirect("/login");
    next();
};

// Borrow a book
router.post('/:bookId', isAuthenticated, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).send('User not authenticated');
        }

        const book = await Book.findById(req.params.bookId);
        if (!book || book.availableCopies <= 0) {
            return res.status(400).send('Book not available');
        }

        book.availableCopies -= 1;
        await book.save();

        const borrow = new Borrow({ user: req.session.user._id, book: book._id });
        await borrow.save();

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.post("/return/:id", isAuthenticated, async (req, res) => {
    try {
        const borrow = await Borrow.findById(req.params.id);
        const book = await Book.findById(borrow.book);
        if (!borrow) return res.status(404).send("Borrow record not found");

        if (borrow.user.toString() !== req.session.user._id) {
            return res.status(403).send("Unauthorized to return this book");
        }

        book.availableCopies += 1;
        await book.save();

        borrow.returned = true;
        await borrow.save();

        res.redirect("/dashboard"); // Redirect back to the dashboard after returning
    } catch (err) {
        console.error(err);
        res.status(500).send("Error returning book");
    }
});

// DELETE borrow record
router.post("/delete/:id", isAuthenticated, async (req, res) => {
    try {
        const borrowId = req.params.id;
        await Borrow.findByIdAndDelete(borrowId);
        res.redirect("/dashboard"); // Redirect to dashboard after deletion
    } catch (err) {
        console.error("Error deleting borrow record:", err);
        res.status(500).send("Error deleting borrow record");
    }
});

module.exports = router;
