import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ApiResponse } from "../utils/helpers";

export const validate = (validations: ValidationChain[]) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // check for errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      ApiResponse.error(
        res,
        "Validation failed",
        400,
        errors.array().map((err) => ({
          field: err.type === "field" ? err.path : "unknown",
          message: err.msg,
        })),
      );
      return;
    }

    next();
  };
};
