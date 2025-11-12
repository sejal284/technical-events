import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // attach user data to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

export const adminMiddleware = (req, res, next) => {
  // First check if user is authenticated
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    
    // Check if user is admin
    if (verified.userType !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};
