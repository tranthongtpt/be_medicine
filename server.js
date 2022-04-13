require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

const app=express()
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({
    useTempFiles: true
}))

//routers
app.use('/user',require('./routers/useRouter'))
app.use('/api',require('./routers/categoryRouter'))
app.use('/api', require('./routers/upload'))
app.use('/api', require('./routers/productRouter'))

//connect to mongodb
const URI =process.env.MONGODB_URL
mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, err => {
    if(err) throw err;
    console.log('connect to mongoDB')
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () =>{
    console.log('server is running on port', PORT)
})

