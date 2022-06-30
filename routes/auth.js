const express = require("express");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchuser = require("../middleware/fetchuser");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "Sharkyyy";

const router = express.Router();

//Create a user-

router.post(
  "/signup",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(404).json({ success, errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ success, error: "email already exist" });
      }

      const salt = await bcrypt.genSalt(10);
      let secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, JWT_SECRET);

      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);

//authenticate user-

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ success, error: "please try to login with correct creds" });
      }

      const passcompare = await bcrypt.compare(password, user.password);

      if (!passcompare) {
        return res
          .status(400)
          .json({ error: "please try to login with correct creds" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };

      const authtoken = jwt.sign(data, JWT_SECRET);
      success = true;
      res.json({ success, authtoken });
    } catch (error) {
      res.status(500).json("internal server error");
    }
  }
);

//get logged in user details-

router.get("/getuser", fetchuser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    res.json(user);
  } catch (error) {
    res.status(500).json("internal server error");
  }
});

module.exports = router;
