const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({ //user & pass is not defined here
    email:{
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose); //will automatically add user & password to the schema, makes sure user is unique

module.exports = mongoose.model('User', UserSchema);