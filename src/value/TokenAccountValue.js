module.exports = class TokenAccountValue {
    constructor({address, name, symbol, logo, balance, priceUSD, priceZIL, decimals}) {
        this.address = address;
        this.name = symbol;
        this.logo = logo;
        this.balance = balance;
        this.priceUSD = priceUSD;
        this.priceZIL = priceZIL;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
    }
}