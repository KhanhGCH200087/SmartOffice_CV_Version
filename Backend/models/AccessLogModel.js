var mongoose = require('mongoose');

var AccessLogSchema = mongoose.Schema(
    {
        user_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'user'
        },
        department_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'department'
        }, 
        rfid: {
            type: String
        },
        day: {
            type: String
        },
        time: {
            type: String
        },
        image: {
            type: String
        }
    }
);

var AccessLogModel = mongoose.model("access_log", AccessLogSchema, "access_log");
module.exports = AccessLogModel;
