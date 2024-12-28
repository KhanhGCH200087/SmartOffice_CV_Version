var mongoose = require('mongoose');

var SwitchLogicschema = mongoose.Schema(
    {
        active: {
            type: Number
        },
        name: {
            type: String
        }, 
        status_on_off: {
            type: Number
        }, 
        device_id: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'device'
        },
        user: [{
            user_id: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'user_staff'
            },
            permission_level: {type: Number}
        }]
    }
);

var SwitchLogicModel = mongoose.model("switch_logic", SwitchLogicschema, "switch_logic");
module.exports = SwitchLogicModel;