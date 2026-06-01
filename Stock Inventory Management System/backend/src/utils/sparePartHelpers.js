const recalcPartTotals = (part) => {
  part.totalPrice = part.quantity * part.unitPrice;
};

module.exports = { recalcPartTotals };
