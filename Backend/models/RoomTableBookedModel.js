var mongoose = require('mongoose');

var RoomTableSchema = mongoose.Schema(
    {
        room: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'room'
        },
        table_quantity: {
            type: Number
        },
        note: {
            type: String
        },
        active: {
            type: Number
        }
    }
);

var RoomTableBookedModel = mongoose.model("room_table_booked", RoomTableSchema, "room_table_booked");
module.exports = RoomTableBookedModel;