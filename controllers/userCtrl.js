const Users = require('../models/userModel')
const bycryt = require('bcrypt')
const jwt = require('jsonwebtoken');
const { json } = require('express/lib/response');
// const req = require('express/lib/request');


const userCtrl = {
    register: async (req, res) => {
        try {
            const {
                name,
                email,
                password
            } = req.body;
            const user = await Users.findOne({
                email
            })
            if (user) return res.status(400).json({
                msg: " the email already exists. "
            })

            if (password.length < 6)
                return res.status(400).json({
                    msg: "pass is the least 6 characters long. "
                })


            //passs
            const passwordHash = await bycryt.hash(password, 10)
            const newUser = new Users({
                name,
                email,
                password: passwordHash
            })

            //save mongodb
            await newUser.save()

            //then create jsonwebtoken to authentication
            const accesstoken = createAccessToken({
                id: newUser._id
            })
            const refreshtoken = createRefreshToken({
                id: newUser._id
            })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            res.json({
                accesstoken
            })
            // res.json({msg:"register success! "})
        } catch (err) {
            return res.status(500).json({
                msg: err.message
            })
        }
    },
    login: async (req,res)=>{
        try {
            const {email,password} =req.body;

            const user = await Users.findOne({email})
            if(!user) return res.status(400).json({msg:"user donse not exist."})
            const isMatch = await bycryt.compare(password,user.password)
            if(!isMatch) return res.status(400).json({msg: " incorrect passord "})
        //if login success, create access token and refresh token
            const accesstoken = createAccessToken({
                id: user._id
            })
            const refreshtoken = createRefreshToken({
                id: user._id
            })

            res.cookie('refreshtoken', refreshtoken, {
                httpOnly: true,
                path: '/user/refresh_token'
            })

            res.json({accesstoken})
        } catch (err) {
            return res.status(500).json({
                msg: err.message
            })
        }
    },
    logout:async(req,res) =>{
        try {
            res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
            return res.json({msg: " logged out"})
        } catch (err) {
            return res.status(500).json({
                msg: err.message
            })
        }
    },
    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshtoken;
            if (!rf_token) return res.status(400).json({
                msg: " plz login orr register"
            })
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                const accesstoken = createAccessToken({
                    id: user.id
                })
                res.json({accesstoken})
            })
        } catch (err) {
            return res.status(500).json({
                msg: err.message
            })
        }
    },
    getUser: async(req,res) =>{ 
        try {
            const user = await Users.findById(req.user.id).select('-password')
            if(!user) return res.status(400).json(({msg: " user dose not exits"}))
            res.json(user)
        } catch (err) {
            return res.status(500).json({
                msg: err.message
            })
        }
    }
}
const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d'
    })
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '7d'
    })
}

module.exports = userCtrl