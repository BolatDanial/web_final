const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const router = express.Router();
const multer = require("multer");

// Middleware to protect routes
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) return res.redirect("/login");
    next();
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.status(403).send("Access Denied: Admins Only");
    }
    next();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });


// Show Index Page
router.get("/", (req, res) => {
    res.render("index", { errors: [], oldInput: {}, session: req.session });
});

// Show Register Page
router.get("/register", (req, res) => {
    res.render("register", { errors: [], oldInput: {}, session: req.session  });
});

// Handle User Registration with Validation
router.post("/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("register", { errors: errors.array(), oldInput: req.body, session: req.session  });
        }

        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (user) return res.render("register", { errors: [{ msg: "Email already exists" }], oldInput: req.body, session: req.session  });

            user = new User({ name, email, password });
            await user.save();
            res.redirect("/login");
        } catch (err) {
            console.error(err);
            res.send("Error registering user");
        }
    }
);

// Show Login Page
router.get("/login", (req, res) => {
    res.render("login", { errors: [], session: req.session  });
});

// Handle User Login with Validation
router.post("/login",
    [
        body("email").isEmail().withMessage("Enter a valid email"),
        body("password").notEmpty().withMessage("Password is required"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("login", { errors: errors.array(), session: req.session  });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) return res.render("login", { errors: [{ msg: "User not found" }], session: req.session  });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.render("login", { errors: [{ msg: "Incorrect password" }], session: req.session  });

            req.session.user = user;
            res.redirect("/dashboard");
        } catch (err) {
            console.error(err);
            res.send("Error logging in");
        }
    }
);

// Show dashboard (only for authenticated users)
router.get("/dashboard", isAuthenticated, async (req, res) => {
    try {
        const borrows = await Borrow.find({ user: req.session.user._id }).populate("book");
        res.render("dashboard", { borrows, user: req.session.user, session: req.session  });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error fetching borrowed books");
    }
});

// Logout
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

// Show user profile
router.get("/profile", isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user._id);
    res.render("profile", { user, session: req.session  });
});

// Edit Profile Route
router.get("/profile/edit", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        res.render("edit-profile", { user, session: req.session  });
    } catch (err) {
        console.error(err);
        res.send("Error fetching user profile.");
    }
});

router.post("/profile/edit", isAuthenticated, upload.single("profilePic"), async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = await User.findById(req.session.user._id);
        user.name = name;
        user.email = email;

        // Save profile picture path if uploaded
        if (req.file) {
            user.profilePic = `/uploads/${req.file.filename}`;
        }

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        req.session.user = user; // Update session
        res.redirect("/profile");
    } catch (err) {
        console.error(err);
        res.send("Error updating profile");
    }
});

// Handle account deletion
router.post("/profile/delete", isAuthenticated, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.session.user._id);
        req.session.destroy(() => {
            res.redirect("/register");
        });
    } catch (err) {
        console.error(err);
        res.send("Error deleting account");
    }
});

router.get("/admin", isAdmin, (req, res) => {
    res.send("Welcome Admin! Manage users here.");
});

router.get("/admin/users", isAdmin, async (req, res) => {
    const users = await User.find();
    res.render("admin-users", { users, session: req.session  });
});

module.exports = router;
