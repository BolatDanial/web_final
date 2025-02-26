const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// Get all books (with search and category filter)
router.get("/", async (req, res) => {
    try {
        const selectedCategory = req.query.category || "";
        let query = selectedCategory ? { category: selectedCategory } : {};

        const books = await Book.find(query);
        const categories = await Book.distinct("category");

        res.render("books", { books, categories, selectedCategory, session: req.session  });
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).send("Server error");
    }
});

// API Endpoint for live search
router.get("/search", async (req, res) => {
    try {
        const searchQuery = req.query.query || "";
        const selectedCategory = req.query.category || "";

        let query = {
            title: { $regex: searchQuery, $options: "i" } // Case-insensitive search
        };
        if (selectedCategory) {
            query.category = selectedCategory; // Filter by category if selected
        }

        const books = await Book.find(query);
        res.json(books); // Return filtered books as JSON
    } catch (err) {
        console.error("Error searching books:", err);
        res.status(500).send("Server error");
    }
});

module.exports = router;
