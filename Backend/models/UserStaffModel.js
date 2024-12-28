var mongoose = require('mongoose');

var UserStaffSchema = mongoose.Schema(
    {
        email: {
            type: String
        },
        password: {
            type: String
        },
        rfid: {
            type: String
        },
        name: {
            type: String
        },
        role: {
            type: String
        },
        active: {
            type: Number
        }, 
        image: {
            type: String
        },
        room_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'room'
        },
        borrow_book: [{
            book_id: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'book_data'
            },
            day_borrow: {type: String}
        }],
        table_booked:[{
            subject_table_id: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'subject_table'
            },
            day: {type: String},
            time: {type: String},
            note: {type: String}
        }]
    }
);

var UserStaffModel = mongoose.model("user_staff", UserStaffSchema, "user_staff");
module.exports = UserStaffModel;