import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3838

app.use(express.json())
app.use(cookieParser())

import userRoute from "./routes/user.route"
app.use("/api/v1", userRoute)


app.get("/",(req,res) => {
    res.send("Home page")
})


app.listen(PORT, () => {
    console.log(`SERVER IS UP AND RUNNING ON PORT ${PORT}`)
}).on("error", (err) => {
    console.log("Failed to start the serevr", err);
    
})
