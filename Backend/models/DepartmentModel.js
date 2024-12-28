var mongoose = require('mongoose');

var DepartmentSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        description: {
            type: String
        },
        active: {
            type: Number
        },
        device: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'device'
        }
    }
);

var DepartmentModel = mongoose.model("department", DepartmentSchema, "department");
module.exports = DepartmentModel;