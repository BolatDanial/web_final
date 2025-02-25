const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Category = require('../models/Category');

// Get all books (Ensure category is populated)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find().populate('category').exec();
        res.render('books', { books, session: req.session  });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
