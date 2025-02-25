const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    borrowDate: { type: Date, default: Date.now },
    returnDate: Date,
    returned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Borrow', borrowSchema);
