var mongoose = require('mongoose');

var BookSchema = mongoose.Schema({
    name: {
        type: String
    },
    rfid_book: {
        type: String
    }, 
    active: {
        type: Number
    },
    note: {
        type: String
    }
});

var BookDataModel = mongoose.model("book_data", BookSchema, "book_data");
module.exports = BookDataModel;