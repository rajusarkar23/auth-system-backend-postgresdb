import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import session from "express-session"

// env config
dotenv.config()

// create app
const app = express()
// add port
const PORT = process.env.PORT || 3838

// accept json and cookies
app.use(express.json())
app.use(cookieParser())
//cors
app.use(cors({
    origin: "http://localhost:5173",
    methods: "GET,HEAD,POST,PUT,PATCH,DELETE",
    credentials: true
}))

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: process.env.GOOGLE_REDIRECT_URI
// },

// ))

// router
import userRoute from "./routes/user.route"
app.use("/api/v1", userRoute)

// test in home route
app.get("/",(req,res) => {
    res.send("Home page")
})

// create express app
app.listen(PORT, () => {
    console.log(`SERVER IS UP AND RUNNING ON PORT ${PORT}`)
}).on("error", (err) => {
    console.log("Failed to start the serevr", err);
    
})
