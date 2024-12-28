var mongoose = require('mongoose');

var SubjectTableSchema = mongoose.Schema({
    room_table_booked: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'room_table_booked'
    },
    table_name: {
        type: String
    },
    status: {
        type: Number
    },
    device: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'device'
    }
});

var SubjectTableModel = mongoose.model("subject_table", SubjectTableSchema, "subject_table");
module.exports = SubjectTableModel;
