import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();
const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_HOST_PORT,
    password: process.env.REDIS_HOST_PASSWORD,
    // tls:{}
});

redisClient.on("error", (error) => {
    console.error(`Error connecting to Redis: ${error}`);
})
redisClient.on("connect", () => {
    console.log("Connected to Redis successfully.");
})

export {
    redisClient
}

