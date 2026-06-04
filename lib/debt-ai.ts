export function calculateDebtStatus(payment: {
  amount: number;
  paid: number;
}) {
  const remaining = payment.amount - payment.paid;

  if (remaining <= 0) {
    return {
      status: "paid",
      label: "Fizetve",
      severity: "green",
    };
  }

  if (remaining < payment.amount * 0.3) {
    return {
      status: "warning",
      label: "Részben fizetve",
      severity: "yellow",
    };
  }

  return {
    status: "debt",
    label: "Tartozás",
    severity: "red",
  };
}