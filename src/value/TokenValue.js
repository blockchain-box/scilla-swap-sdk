module.exports = class TokenValue {
    constructor({address, name, symbol, logo, priceUSD, priceZIL, priceCarb, decimals}) {
        this.address = address;
        this.name = symbol;
        this.logo = logo;
        this.priceUSD = priceUSD;
        this.priceZIL = priceZIL;
        this.name = name;
        this.symbol = symbol;
        this.decimals = decimals;
        this.priceCarb = priceCarb;
    }

}