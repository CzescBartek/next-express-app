import { Router, Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router();

interface AuthRequest extends Request {
  user?: any;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

// ✅ Sprawdzenie działania serwera
router.get("/", async (req: Request, res: Response): Promise<any> => {
  return res.send("Server is running!");
});

// ✅ REJESTRACJA NOWEGO UŻYTKOWNIKA
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name } = req.body;

    // Sprawdzenie, czy użytkownik już istnieje
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hashowanie hasła
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tworzenie użytkownika
    const newUser = new User({ email, password: hashedPassword, name });
    await newUser.save();

    // Generowanie tokenów
    const accessToken = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: newUser._id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ accessToken, refreshToken, user: { id: newUser._id, email, name } });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// ✅ LOGOWANIE UŻYTKOWNIKA
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.json({ accessToken, refreshToken, user: { id: user._id, email, name: user.name } });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// ✅ ODŚWIEŻANIE TOKENA
router.post("/refresh", async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: "No refresh token provided" });

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.REFRESH_SECRET as string);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// ✅ PROFIL UŻYTKOWNIKA
router.get("/profile", authMiddleware, async (req: AuthRequest, res): Promise<any> => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ ZWROT AKTUALNEGO UŻYTKOWNIKA
router.get("/me", authMiddleware, async (req, res): Promise<any> => {
  return res.json(req.user);
});

export default router;
