import { Router, Request, Response } from "express";
import authMiddleware from "../middleware/authMiddleware";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const router = Router(); // 👈 Upewnij się, że używasz Router() zamiast express()

interface AuthRequest extends Request {
  user?: any;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: any;
  }
}

// routes/authRoutes.ts
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

    res.json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});


router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

    return res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
});

// routes/authRoutes.ts
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

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

router.get("/profile", authMiddleware, async (req: any, res) => {
  try {
    const user = req.user;
    res.json({ username: user.username, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json(req.user);
});

export default router;
