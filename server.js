import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import { config } from "dotenv";

const app = express();

config({
    path: "./config.env",
})

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    cors({
        origin: [process.env.FRONTEND_URL],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
    })
);


const realtimeUrl = "https://api.tomorrow.io/v4/weather/realtime";

const api_key = process.env.API_KEY;
let searchLocation = "London";

// Setting the current location manually
app.post("/", async(req, res) => {
    let {location} = req.body;
    searchLocation = location;
    res.redirect("/");
})

// Getting data for given location
app.get("/", async (req, res) => {
   try {
    let location  = searchLocation;
    if(!location) location = "Mumbai"
    const response = await axios.get(`${realtimeUrl}?location=${location}&apikey=${api_key}`,
    { headers: {Accept: 'application/json'} });

    res.json({
        success: true,
        weatherCode: response.data.data.values.weatherCode,
        humidity: response.data.data.values.humidity,
        temprature: response.data.data.values.temperature,
        tempratureApparent: response.data.data.values.temperatureApparent,
        visibility: response.data.data.values.visibility,
        location: response.data.location.name,
        data: response.data.data.values,
    })
   } catch (error) {
    res.status(401).json({
        success: false,
        type: error.response?.data?.type ?? "Unknown Type",
        message: error.response?.data?.message ?? "Something went Wrong",
    })
   }
});

// Finding your current location
app.get("/current", async (req, res) => {
    try {
        const response = await axios.get(`https://api.tomorrow.io/v4/locations?apikey=${api_key}`,
        { headers: {Accept: 'application/json'} });
        res.json({
            success: true,
            location: response.data.data.locations[0].name,
            coordinates: response.data.data.locations[0].geometry.coordinates,
            timezone: response.data.data.locations[0].timezone,
            createdAt: response.data.data.locations[0].createdAt,
            updatedAt: response.data.data.locations[0].updatedAt,

        })
    } catch (error) {
        res.status(401).json({
            type: error.response?.data?.type ?? "Unknown Type",
            message: error.response?.data?.message ?? "Something went Wrong",
        })
    }
})


app.listen(process.env.PORT, () => {
    console.log("Server is running");
})




