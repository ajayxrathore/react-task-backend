import { connectDB } from "./src/db/connection.js";
import {app} from "./src/app.js";
import http from "http";
import { Server } from "socket.io";
import { handleSocket } from "./src/socketHandler.js";
import dotenv from "dotenv";
dotenv.config();
const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin: "https://react-task-dt8ad1feb-ajay-rathores-projects-1380d7fa.vercel.app/",
        methods: ["GET", "POST"],
        credentials: true,
    }
});
handleSocket(io);
connectDB().then(() => {
    console.log("Connected to the database successfully.");

    server.listen(process.env.PORT, () => {
        console.log(`Server is listening at http://localhost:${process.env.PORT}`);
    })
}).catch((error) => {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
})

