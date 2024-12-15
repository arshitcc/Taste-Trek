import { asyncHandler } from "../utils/asyncHandler";
import { Response } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { IAddress, User, IUser } from "../models/users.model";
import { uploadFile, deleteFile } from "../utils/cloudinary";
import { generateTokens } from "../utils/generateTokens";
import mongoose, { isValidObjectId } from "mongoose";
import { CustomRequest } from "../models/users.model";

const userSignup = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { fullname, email, phone, password } = req.body;

  if (!email?.trim() && !phone?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  if ([fullname, password].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  const userExists = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  const avatarPath = req.file?.path || "";
  const avatarUrl = (await uploadFile(avatarPath)) || "";

  const user = await User.create({
    fullname: fullname.trim(),
    email: email.trim().toLowerCase() || "",
    phone: phone.trim() || "",
    password,
    avatar: avatarUrl,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken "
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User registered successfully", createdUser));
});

const userLogin = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { user, password } = req.body;

  if (!user?.trim()) {
    throw new ApiError(400, "Username, phone or email is required");
  }

  if (!password?.trim()) {
    throw new ApiError(400, "Password is required");
  }

  const myuser = await User.findOne({
    $or: [{ username: user }, { phone: user }, { email: user }],
  });

  if (!myuser) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordValid = await myuser.validatePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Wrong password");
  }

  const { accessToken, refreshToken } = await generateTokens(myuser);

  const loggedInUser = await User.findById(myuser._id).select(
    "-password -refreshToken "
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Something went wrong while logging in the user");
  }

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, "User logged in successfully", loggedInUser));
});

const userLogout = asyncHandler(async (req: CustomRequest, res: Response) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

const getUser = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (userId !== req.user._id.toString()) {
    throw new ApiError(400, "Unauthorized access");
  }

  const user = await User.findById(userId).select("-password -refreshToken ");
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "User details fetched successfully", user));
});

const refreshAccessToken = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { refreshToken } = req.cookies.refreshToken;
    const user = req.user;

    if (user?.refreshToken !== refreshToken) {
      throw new ApiError(400, "Unauthorized Refresh Token Access");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user as IUser
    );
    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(new ApiResponse(200, "Access Token refreshed successfully", {}));
  }
);

const updatePassword = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body;

    if (
      [oldPassword, newPassword].some((field) => !field || field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const myuser = await User.findById(req.user._id);
    const isPasswordValid = await myuser?.validatePassword(oldPassword);

    if (!isPasswordValid) {
      throw new ApiError(401, `Wrong Old Password entered !!`);
    }

    req.user.password = newPassword;
    await req.user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Password updated successfully", {}));
  }
);

const updateProfile = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { fullname, email, username, phone } = req.body;
        
    if (
      [fullname, email, phone].some((field) => !field || field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({username});
    
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      throw new ApiError(400, "Username already exists");
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      throw new ApiError(400, "User not found");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { fullname, email, username, phone },
      { new: true }
    ).select("-password -refreshToken -addresses");

    if (!updatedUser) {
      throw new ApiError(
        500,
        "Something went wrong while updating the profile"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, "Profile updated successfully", updatedUser));
  }
);

const updateAvatar = asyncHandler(async (req: CustomRequest, res: Response) => {
  const oldAvatar = req.user.avatar;
  const avatarPath = req.file?.path || "";
  if (!avatarPath?.trim()) {
    throw new ApiError(400, "Avatar is required");
  }
  let avatarUrl = (await uploadFile(avatarPath)) || "";  
  if (oldAvatar?.trim()) await deleteFile(oldAvatar);  

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select("-password -refreshToken -addresses");

  if (!updatedUser) {
    throw new ApiError(500, "Something went wrong while updating the avatar");
  }

  req.user = updatedUser;

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Profile Image updated successfully", updatedUser)
    );
});

const addNewAddress = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { street, pincode, city, state, country }: IAddress = req.body;
    let { latitude, longitude } : { latitude: number; longitude: number } = req.body;

    if (
      [street, pincode, city, state, country].some(
        (field) => field?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    let location: { latitude: number; longitude: number };
    if(latitude && longitude) {
      location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      }
    }
    else {
      if(!latitude) latitude = 0;
      if(!longitude) longitude = 0;
      location = {
        latitude: Number(latitude),
        longitude: Number(longitude),
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $push: {
          addresses: {
            _id: new mongoose.Types.ObjectId().toString(),
            street,
            city,
            state,
            country,
            pincode,
            location,
          },
        },
      },
      { new: true }
    ).select("-password -refreshToken ");

    if (!updatedUser) {
      throw new ApiError(
        500,
        "Something went wrong while adding the new address"
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, "New address added successfully", updatedUser)
      );
  }
);

const removeAddress = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { addressId } = req.params;

    if (!isValidObjectId(addressId)) {
      throw new ApiError(400, "Invalid address id");
    }

    const address = await User.aggregate([
      {
        $match: {
          _id: req.user._id,
          addresses: {
            $elemMatch: {
              _id: addressId,
            },
          },
        },
      },
    ]);

    if (address.length === 0) {
      throw new ApiError(400, "Unauthorized access to remove the address");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $pull: {
          addresses: { _id: addressId },
        },
      },
      { new: true }
    ).select("-password -refreshToken ");

    if (!updatedUser) {
      throw new ApiError(
        500,
        "Something went wrong while removing the address"
      );
    }

    req.user = updatedUser;

    return res
      .status(200)
      .json(new ApiResponse(200, "Address removed successfully", updatedUser));
  }
);

export {
  userSignup,
  userLogin,
  userLogout,
  refreshAccessToken,
  getUser,
  updatePassword,
  updateProfile,
  updateAvatar,
  addNewAddress,
  removeAddress,
};
