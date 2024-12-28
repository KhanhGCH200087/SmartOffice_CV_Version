var mongoose = require('mongoose');

var BookedRoomSchema = mongoose.Schema(
    {
        room: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'room'
        },
        day: {
            type: String
        }, 
        time_start: {
            type: String
        },
        time_end: {
            type: String
        },
        QR_code: {
            type: String
        },
        note: {
            type: String
        },
        active:{
            type: Number
        },
        user_staff:[{
            user: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'user_staff'
            },
            level: {
                type: Number
            }
        }]
    }
);

var BookedRoomModel = mongoose.model("booked_room", BookedRoomSchema, "booked_room");
module.exports = BookedRoomModel;