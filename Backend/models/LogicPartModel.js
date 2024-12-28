var mongoose = require('mongoose');

var LogicPartSchema = mongoose.Schema(
    {
        switch_logic_id:{
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'switch_logic'
        },
        active: {type: Number},
        device_status: {type: Number},
        type: {type: String},
        day: {type: String},
        time: {type: String}
    }
);

var LogicPartModel = mongoose.model("logic_part", LogicPartSchema, "logic_part");
module.exports = LogicPartModel;