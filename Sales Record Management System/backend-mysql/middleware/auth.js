import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }
  try {
    req.user = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET || "exam_secret");
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default auth;
