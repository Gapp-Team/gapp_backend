const config = require("config");
const { mongoose, Schema } = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

mongoose.set('strictQuery', false);




const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin:{
        type:Boolean
    }
}, { timestamps: true });

//user şemasına göre kayıt olma  validation(kuralları) 

function validateRegister(user) {
    const schema = new Joi.object({
        name: Joi.string().min(3).max(50).required(),
        email: Joi.string().min(3).max(50).required().email(),
        password: Joi.string().min(5).required(),
    });

    return schema.validate(user);
}

//giriş yapma kuralları 
function validateLogin(user) {
    const schema = new Joi.object({
        email: Joi.string().min(3).max(50).required().email(),
        password: Joi.string().min(5).required(),
    });

    return schema.validate(user);
}

//authentication token üretiliyor. Ayrıca şifre database'de güvenlik için şifrelenerek tutuluyor.
//token'ın payload kısmına id ve isAdmin eklendi. Böylelikle isAdmin kontrolü de yapılabilecek. jwt web token'dan token header ve payload içine bakılabilir. 

userSchema.methods.createAuthToken = function() {
    const decodedToken = jwt.sign({ _id: this._id, isAdmin:this.isAdmin}, config.get("auth.jwtPrivateKey"));
    return decodedToken;
};

const User = mongoose.model("User", userSchema);

module.exports = { User, validateRegister, validateLogin };