import express from "express";
import cors from "cors";
import userRouter from "./routes/authRoutes.js";
const app = express();

app.use(express.json());
app.use(
  cors({
    origin:
      "https://react-task-sigma-three.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("API is working fine");
});

app.use("/", userRouter);

app.use((error, req, res, next) => {
  res.status(500).json({ error: error.message });
});

export { app };
