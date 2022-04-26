const BigNumber = require("bignumber.js");
module.exports = (number, decimal) => new BigNumber(number).shiftedBy(-parseInt(decimal)).toString();