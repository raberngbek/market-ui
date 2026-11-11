export const money = (amount, currencyCode = 'USD') => {
  const num = Number(amount);
  if (isNaN(num)) return currencyCode === 'KHR' ? '0 ៛' : '$0.00';
  if (currencyCode === 'KHR') {
    return `${num.toLocaleString()} ៛`;
  }
  return `$${num.toFixed(2)}`;
};
