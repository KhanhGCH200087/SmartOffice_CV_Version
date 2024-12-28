var mongoose = require('mongoose');

var DeviceSchema = mongoose.Schema(
    {
        active: {
            type: Number
        },
        name: {
            type: String
        },
        data: {
            type: String
        },
        type: {
            type: String
        },
        note: {
            type: String
        },
        device_log: [{
            log: {type: String},
            day: {type: String},
            time: {type: String},
            type: {type: String}
        }],
        used: {
            type: String
        }
    }
);

var DeviceModel = mongoose.model("device", DeviceSchema, "device");
module.exports = DeviceModel;