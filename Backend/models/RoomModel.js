var mongoose = require('mongoose');

var RoomSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        floor: {
            type: Number
        },
        active: {
            type: Number
        },
        department: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'department'
        },
        device: [{
            device_id:{
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'device'
            },
            note: {type: String}
        }]
    }
);

var RoomModel = mongoose.model("room", RoomSchema, "room");
module.exports = RoomModel;