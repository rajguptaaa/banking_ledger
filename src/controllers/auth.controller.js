const userModel = require("../models/user.model");
const emailService = require('../services/email.service');
const tokenBlackListModel = require("../models/blacklist.model")

const jwt = require("jsonwebtoken")

async function userRegisterController(req, res) {
    const { email, password, name} = req.body

    const isExists = await userModel.findOne({ email: email });
    if (isExists) return res.status(422).json({ message: "User already exists with this Email", status: "Failed" });

    const user = await userModel.create({
        email, password, name
    })

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET);

    res.cookie("token", token);
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })

    await emailService.sendRegisterEmail(user.email, user.name);
}

async function userLoginController(req, res){
    const {email, password} = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await userModel.findOne({email}).select("+password");
    if(!user) return res.status(401).json({message: "Email is invalid"});

    const isValidPassword = await user.comparePassword(password);
    if(!isValidPassword) return res.status(401).json({message:"Password is invalid"});

    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET);

    res.cookie("token", token);
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        },
        token
    })
}

async function userLogoutController(req, res){
    const token = req.cookies.token || req.headers.autherization?.split(" ")[1];
    if(!token){
        return res.status(400).json({
            message:"User Logged out Successfully"
        })
    }
    res.cookie("token", "")

    await tokenBlackListModel.create({
        token: token
    })
    res.status(200).json({
        message:"User Logged out Successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}