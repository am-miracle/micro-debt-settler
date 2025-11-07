import { Router } from "express";
import * as friendController from "../controllers/friend.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { friendValidators } from "../utils/validators";

const router = Router();

// All friend routes require authentication
router.use(authenticate);

router.post("/", validate(friendValidators.add), friendController.addFriend);
router.get(
  "/search",
  validate(friendValidators.searchUser),
  friendController.searchUserByEmail,
);
router.get("/", friendController.getFriends);
router.get(
  "/:id",
  validate(friendValidators.getById),
  friendController.getFriend,
);
router.patch(
  "/:id",
  validate(friendValidators.update),
  friendController.updateFriend,
);
router.delete(
  "/:id",
  validate(friendValidators.delete),
  friendController.deleteFriend,
);

export default router;
