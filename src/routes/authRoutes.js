import { Router } from "express";
import { User } from "../models/user.model.js";
import { redisClient } from "../config/redis.js";
import transporter from "../utils/mailer.js";
import sgMail from "@sendgrid/mail";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { onlineUsers } from "../onlineUsers.js";
const router = Router();

// Add your routes here
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
router.post("/signup", async (req, res) => {
  // Implement user registration logic here
  console.log(`we receiving signup request`);

  const { fullName, email, number, password } = req.body;
  if (!fullName || !email || !number || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "Email already exists." });
  }
  const mobileOtp = generateOtp();
  const emailOtp = generateOtp();

  await redisClient.setex(
    `signup:${email}:data`,
    900,
    JSON.stringify({ fullName, email, number, password })
  );
  await redisClient.setex(`signup:${email}:mobileOtp`, 300, mobileOtp);
  await redisClient.setex(`signup:${email}:emailOtp`, 300, emailOtp);
  const resend = new Resend(process.env.RESEND_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  try {
    //   await transporter.sendMail({
    //     from: process.env.USER_EMAIL_ADDRESS,
    //     to: email,
    //     subject: "OTP Verification",
    //     text: `Your email OTP is ${emailOtp}`,
    //   });
    //   console.log("Email sent successfully");
    // await resend.emails.send({
    //     from: "noreply@resend.com",
    //     to: email,
    //     subject: "OTP Verification",
    //     text: `Your email OTP is ${emailOtp}`,
    // });
    await sgMail.send({
        to: email,
        from:process.env.USER_EMAIL_ADDRESS,
        subject: "OTP Verification",
        text: `Your email OTP is ${emailOtp}`,
    })
    console.log("Email sent successfully",email);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue with the response even if email fails
    }

  res.status(201).json({
    ok: true,
    email,
    message:
      "Registration successful. Please check your email and page for OTP verification.",
    mobileOtp,
  });
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, emailOtp, mobileOtp } = req.body;
    if (!email || !emailOtp || !mobileOtp) {
      return res.status(400).json({ message: "All fields are required." });
    }
    const data = await redisClient.get(`signup:${email}:data`);
    const storedEmailOtp = await redisClient.get(`signup:${email}:emailOtp`);
    const storedMobileOtp = await redisClient.get(`signup:${email}:mobileOtp`);
    if (!data || !storedEmailOtp || !storedMobileOtp) {
      return res.status(400).json({ message: "Session expired." });
    }
    if (emailOtp !== storedEmailOtp) {
      return res.status(400).json({ message: "Invalid email OTP." });
    }
    if (mobileOtp !== storedMobileOtp) {
      return res.status(400).json({ message: "Invalid mobile OTP." });
    }
    const parsedData = JSON.parse(data);
    const user = new User(parsedData);
    await user.save();

    await Promise.all([
      redisClient.del(`signup:${email}:data`),
      redisClient.del(`signup:${email}:emailOtp`),
      redisClient.del(`signup:${email}:mobileOtp`),
    ]);
    res.status(200).json({ message: "Registration successful." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password." });
  }
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid password." });
  }
  res.status(200).json({
    email,
    message: "Login successful.",
  });
});
router.get("/admin", async (req, res) => {
  try {
    const users = await User.find({}, "fullName email number");
    const result = users.map((user) => ({
      fullName: user.fullName,
      email: user.email,
      number: user.number,
      status: onlineUsers.has(user.email) ? "Online" : "Offline",
    }));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
export default router;
