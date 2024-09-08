import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../lib/utils/generateToken.js";

//Signup

export const Signup = async (req, res) => {
  const { username, Fullname, email, password } = req.body;

  console.log(!username);
  console.log(!email);
  console.log(!password);
  console.log(!Fullname);

  try {
    if (!username || !Fullname || !email || !password) {
      console.log(`All the fields are required`);

      return res.status(400).json({
        success: false,
        message: "All the fields are compulsory",
      });
    }

    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    console.log("Email...");

    console.log(emailRegex.test(email));
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        success: false,
        message: "invalid email",
      });
    }

    const existingUsername = await User.findOne({ username });

    const existingEmail = await User.findOne({ email });

    if (existingEmail || existingUsername) {
      return res.status(401).json({
        success: false,
        message:
          "Username/Email already taken use another name/email instead!!",
      });
    }

    //hashing the password

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      Fullname,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      // await newUser.save();

      res.status(201).json({
        _id: newUser._id,
        Fullname: newUser.Fullname,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } else {
      res.status(400).json(`Invalid User data:${error.message}`);
    }
  } catch (error) {
    console.log(`Some error occured while Signing Up:${error.message}`);
    return res.status(500).json({
      message: "Internal Server error!!",
      success: false,
    });
  }
};

export const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      res.status(409).json({
        success: false,
        message: "Email & password both are required",
      });
    }
    const loggedInUser = await User.findOne({ username });
    const enteredPassword = await bcrypt.compare(
      password,
      loggedInUser?.password || ""
    );

    if (!loggedInUser || !enteredPassword) {
      res.status(401).json({
        message: false,
        message: `Invalid Username/Email`,
      });
    }

    generateTokenAndSetCookie(loggedInUser._id, res);

    res.status(201).json({
      _id: loggedInUser._id,
      Fullname: loggedInUser.Fullname,
      username: loggedInUser.username,
      email: loggedInUser.email,
      followers: loggedInUser.followers,
      following: loggedInUser.following,
      profileImg: loggedInUser.profileImg,
      coverImg: loggedInUser.coverImg,
    });
  } catch (error) {
    console.log(`Some error occured while Login Up:${error.message}`);
    return res.status(500).json({
      message: "Internal Server error!!",
      success: false,
    });
  }
};

export const Logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      success: true,
      message: "Logged Out successfully",
    });
  } catch (error) {
    console.log(`Some error occured while Signing Up:${error.message}`);
    return res.status(500).json({
      message: "Internal Server error!!",
      success: false,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({ user });
  } catch (error) {
    console.log(`Some error occured while Signing Up:${error.message}`);
    return res.status(500).json({
      message: "Internal Server error!!",
      success: false,
    });
  }
};
