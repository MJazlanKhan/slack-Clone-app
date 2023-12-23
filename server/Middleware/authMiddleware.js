import jwt from "jsonwebtoken";
import UserModel from "../Models/UserModel.js";

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "secretkey");
      req.user = await UserModel.findById(decoded.userID).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ error: "Not Authorized, Token Failed" });
    }
  }

  if (!token) {
    res.status(401).json({ error: "Not Authorized, No Token" });
  }
};

export default protect;
