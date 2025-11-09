import { User, Debt, Transaction } from "../models";
import { AppError } from "../middleware/error.middleware";
import { getModelData } from "../utils/sequelize-helpers";
import { Op } from "sequelize";

export const getUserStats = async (userId: string) => {
  // get all debts where user is debtor (owes money)
  const owedDebts = await Debt.findAll({
    where: { debtorId: userId },
  });

  // get all debts where user is creditor (is owed money)
  const receivableDebts = await Debt.findAll({
    where: { creditorId: userId },
  });

  const owedDebtsData = owedDebts.map((debt) => getModelData(debt));
  const receivableDebtsData = receivableDebts.map((debt) => getModelData(debt));

  // calculate statistics
  const totalOwedDebts = owedDebtsData.length;
  const totalReceivableDebts = receivableDebtsData.length;

  const settledOwedDebts = owedDebtsData.filter(
    (d) => d.status === "settled",
  ).length;
  const settledReceivableDebts = receivableDebtsData.filter(
    (d) => d.status === "settled",
  ).length;

  const totalOwedAmount = owedDebtsData
    .filter((d) => d.status !== "settled" && d.status !== "cancelled")
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  const totalReceivableAmount = receivableDebtsData
    .filter((d) => d.status !== "settled" && d.status !== "cancelled")
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  const totalSettledOwedAmount = owedDebtsData
    .filter((d) => d.status === "settled")
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  const totalSettledReceivableAmount = receivableDebtsData
    .filter((d) => d.status === "settled")
    .reduce((sum, debt) => sum + Number(debt.amount), 0);

  return {
    debts: {
      owed: {
        total: totalOwedDebts,
        settled: settledOwedDebts,
        pending: totalOwedDebts - settledOwedDebts,
      },
      receivable: {
        total: totalReceivableDebts,
        settled: settledReceivableDebts,
        pending: totalReceivableDebts - settledReceivableDebts,
      },
    },
    amounts: {
      totalDue: totalOwedAmount,
      totalReceivable: totalReceivableAmount,
      totalSettledPaid: totalSettledOwedAmount,
      totalSettledReceived: totalSettledReceivableAmount,
    },
  };
};

export const getUserSettings = async (userId: string) => {
  const user = await User.findByPk(userId, {
    attributes: [
      "id",
      "email",
      "name",
      "phone",
      "avatar",
      "nagSensitivity",
      "pushNotifications",
      "paymentAlerts",
      "emailNotifications",
      "preferredPaymentMethod",
    ],
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const userData = getModelData(user);
  const stats = await getUserStats(userId);

  return {
    user: userData,
    stats,
  };
};

export const updateUserSettings = async (
  userId: string,
  settings: {
    name?: string;
    phone?: string;
    nagSensitivity?: "low" | "medium" | "high";
    pushNotifications?: boolean;
    paymentAlerts?: boolean;
    emailNotifications?: boolean;
    preferredPaymentMethod?:
      | "bank_transfer"
      | "paystack"
      | "flutterwave"
      | "stripe"
      | "paypal";
  },
) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  await user.update(settings);

  const userData = getModelData(user);
  const { passwordHash: _passwordHash, ...userWithoutPassword } = userData;

  return userWithoutPassword;
};

export const getPaymentHistory = async (
  userId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    paymentMethod?: string;
  },
) => {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const offset = (page - 1) * limit;

  // get all debts where user is involved
  const userDebts = await Debt.findAll({
    where: {
      [Op.or]: [{ debtorId: userId }, { creditorId: userId }],
    },
    attributes: ["id"],
  });

  const debtIds = userDebts.map((debt) => getModelData(debt).id);

  // build where clause
  const where: any = { debtId: debtIds };

  if (options.status) {
    where.status = options.status;
  }

  if (options.paymentMethod) {
    where.paymentMethod = options.paymentMethod;
  }

  // get transactions
  const { count, rows: transactions } = await Transaction.findAndCountAll({
    where,
    include: [
      {
        model: Debt,
        as: "debt",
        attributes: [
          "id",
          "amount",
          "currency",
          "description",
          "debtorId",
          "creditorId",
          "debtorName",
          "creditorName",
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
    limit,
    offset,
  });

  const transactionsData = transactions.map((transaction) => {
    const transactionData = getModelData(transaction);
    const debtData = transaction.get("debt")
      ? getModelData(transaction.get("debt"))
      : null;

    return {
      ...transactionData,
      debt: debtData,
      userRole: debtData?.debtorId === userId ? "debtor" : "creditor",
    };
  });

  return {
    transactions: transactionsData,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};
