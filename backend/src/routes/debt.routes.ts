import { Router } from "express";
import * as debtController from "../controllers/debt.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { debtValidators } from "../utils/validators";

const router = Router();

// All debt routes require authentication
router.use(authenticate);

// Create debts
router.post("/", validate(debtValidators.create), debtController.createDebt);
router.post(
  "/receivable",
  validate(debtValidators.createReceivable),
  debtController.createReceivableDebt,
);

// Get debts
router.get("/summary", debtController.getDebtSummary);
router.get(
  "/direction/:direction",
  validate(debtValidators.getByDirection),
  debtController.getDebtsByDirection,
);
router.get("/", validate(debtValidators.getDebts), debtController.getDebts);
router.get("/:id", validate(debtValidators.getById), debtController.getDebt);

// Update/Delete debts
router.patch(
  "/:id",
  validate(debtValidators.update),
  debtController.updateDebt,
);
router.delete(
  "/:id",
  validate(debtValidators.delete),
  debtController.deleteDebt,
);

export default router;
