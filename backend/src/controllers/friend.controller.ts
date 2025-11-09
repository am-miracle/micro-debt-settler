import { Request, Response, NextFunction } from "express";
import { Contact, User } from "../models";
import { ApiResponse } from "../utils/helpers";
import { CONSTANTS } from "../utils/constants";
import { AppError } from "../middleware/error.middleware";

// add a contact (friend)
// this support both registered and non-registered users
export const addFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { friendEmail, friendName, friendPhone, nickname, notes } = req.body;
    const userId = req.userId!;

    // check if contact already exists
    const existingContact = await Contact.findOne({
      where: { userId, email: friendEmail },
    });

    if (existingContact) {
      throw new AppError("Contact already exists", 400);
    }

    // check if the email belongs to a registered user
    const registeredUser = await User.findOne({
      where: { email: friendEmail },
      attributes: ["id", "name", "phone"],
    });

    // create contact
    const contact = await Contact.create({
      userId,
      contactUserId: registeredUser ? (registeredUser as any).id : null,
      email: friendEmail,
      name:
        friendName ||
        (registeredUser ? (registeredUser as any).name : friendEmail),
      phone:
        friendPhone || (registeredUser ? (registeredUser as any).phone : null),
      nickname,
      notes,
    });

    ApiResponse.success(res, contact, CONSTANTS.SUCCESS.FRIEND_ADDED, 201);
  } catch (error) {
    next(error);
  }
};

// get all contacts (friends)
export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.userId!;

    const contacts = await Contact.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "contactUser",
          attributes: ["id", "name", "email", "phone", "avatarUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    ApiResponse.success(res, contacts, "Contacts retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const contact = await Contact.findOne({
      where: { id, userId },
      include: [
        {
          model: User,
          as: "contactUser",
          attributes: ["id", "name", "email", "phone", "avatarUrl"],
        },
      ],
    });

    if (!contact) {
      throw new AppError(CONSTANTS.ERRORS.FRIEND_NOT_FOUND, 404);
    }

    ApiResponse.success(res, contact, "Contact retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { friendName, friendPhone, nickname, notes } = req.body;

    const contact = await Contact.findOne({
      where: { id, userId },
    });

    if (!contact) {
      throw new AppError(CONSTANTS.ERRORS.FRIEND_NOT_FOUND, 404);
    }

    // only update fields that are not linked to a registered user
    // or allow nickname/notes to always be updated
    await (contact as any).update({
      ...(!(contact as any).contactUserId &&
        friendName && { name: friendName }),
      ...(!(contact as any).contactUserId &&
        friendPhone && { phone: friendPhone }),
      ...(nickname !== undefined && { nickname }),
      ...(notes !== undefined && { notes }),
    });

    ApiResponse.success(res, contact, "Contact updated successfully");
  } catch (error) {
    next(error);
  }
};

export const deleteFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const contact = await Contact.findOne({
      where: { id, userId },
    });

    if (!contact) {
      throw new AppError(CONSTANTS.ERRORS.FRIEND_NOT_FOUND, 404);
    }

    await (contact as any).destroy();

    ApiResponse.success(res, null, CONSTANTS.SUCCESS.FRIEND_REMOVED);
  } catch (error) {
    next(error);
  }
};

// search for a user by email (only for registered user)
export const searchUserByEmail = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email } = req.query;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const user = await User.findOne({
      where: { email: email as string },
      attributes: ["id", "email", "name", "phone", "avatarUrl"],
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    ApiResponse.success(res, user, "User found");
  } catch (error) {
    next(error);
  }
};
