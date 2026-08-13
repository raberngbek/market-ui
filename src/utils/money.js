export const money = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
};
