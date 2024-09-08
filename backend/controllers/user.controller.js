import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
export const getUser = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server occured:${error.message}`,
    });
  }
};

// export const followunfollow = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const usertoModify = await User.findById(id);
//     const currentUser = await User.findById(req.user._id);

//     if (id === req.user._id.toString()) {
//       res.status(400).json({
//         success: false,
//         message: "You cannot follow /unfollow yourself",
//       });
//     }

//     if (!currentUser || !usertoModify) {
//       return res.status(400).json({
//         success: false,
//         message: "User Does not exist",
//       });
//     }
//     console.log("Current User:", currentUser);
//     console.log("User to Modify:", usertoModify);

//     const isfollowing = await currentUser.following.includes(id);

//     if (isfollowing) {
//       await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
//       await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

//       res.status(200).json({
//         message: `user unfollowed successfully`,
//       });
//     } else {
//       await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
//       await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

//       res.status(200).json({
//         message: "user followed successfully",
//       });

//       const Notification = new Notification({
//         type: "follow",
//         from: req.user._id,
//         to: usertoModify._id,
//       });

//       await Notification.save();

//       res.status(200).json({
//         message: "User followed Successfully",
//         success: true,
//       });
//     }
//   } catch (error) {
//     console.log("Error in followUnfollowUser: ", error.message);
//     res.status(500).json({ error: error.message });
//   }
// };

// import Notification from "path-to-notification-model"; // Ensure proper import

export const followunfollow = async (req, res) => {
  const { id } = req.params;

  // Check if req.user is defined
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: User not logged in",
    });
  }

  try {
    // Fetch users
    const usertoModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    // Check if users exist
    if (!usertoModify) {
      return res.status(400).json({
        success: false,
        message: "User to modify does not exist",
      });
    }
    if (!currentUser) {
      return res.status(400).json({
        success: false,
        message: "Current user does not exist",
      });
    }

    // Prevent self-following
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow/unfollow yourself",
      });
    }

    // Check follow status
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      return res.status(200).json({
        message: "User unfollowed successfully",
      });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

      // Create notification
      const notification = new Notification({
        type: "follow",
        from: req.user._id,
        to: usertoModify._id,
      });

      await notification.save();

      return res.status(200).json({
        message: "User followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const usersfollowedByMe = await User.findById(req.user._id).select(
      "following"
    );

    const users = await User.aggregate([
      {
        $match: {
          _id: {
            $ne: req.user._id,
          },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter((user) => {
      !usersfollowedByMe.following.includes(user._id);
    });
    const suggestedUser = filteredUsers.slice(0, 4);

    suggestedUser.forEach((users) => {
      users.password = null;
    });
    res.status(200).json(suggestedUser);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { username, Fullname, email, currentPassword, newPassword, bio, link } =
    req.body;

  let { profileImg, coverImg } = req.body;

  const userId = req.user._id;

  try {
    let user = await User.findById({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user not found",
      });
    }

    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current and new password",
      });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: "Current Password does not match",
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }

      const uploadResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadResponse.secure_url;
    }

    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadResponse.secure_url;
    }

    user.Fullname = Fullname || user.Fullname;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;

    user = await user.save();

    return res.status(200).json(user);
  } catch (error) {
    res.status(400).json({
      message: "Error occured while updation",
    });
  }
};
