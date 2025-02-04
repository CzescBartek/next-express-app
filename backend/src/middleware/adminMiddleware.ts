// middleware/adminMiddleware.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/User";

interface AuthRequest extends Request {
  user?: any;
}

const adminMiddleware = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }

  next();
};

export default adminMiddleware;
