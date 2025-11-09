import { Response } from "express";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const ApiResponse = {
  success: (
    res: Response,
    data: any,
    message = "Success",
    statusCode = 200,
  ) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res: Response, message = "Error", statusCode = 500, errors?: any) => {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  },

  paginated: (
    res: Response,
    data: any[],
    page: number,
    limit: number,
    total: number,
    message = "Success",
  ) => {
    const pagination: PaginationInfo = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };

    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  },
};

export const calculateDueDate = (hours: number): Date => {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000);
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};
