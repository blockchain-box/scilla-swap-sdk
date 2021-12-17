const TokenAccountValue = require("./TokenAccountValue");
const BigNumber = require("bignumber.js");
module.exports = class PoolAccountValue {
    constructor({
                    account,
                    token = new TokenAccountValue({}),
                    lpBalance,
                    totalBalance,
                    carbAmount,
                    tokenAmount,
                    priceUSD,
                    carbLogo,
                }) {
        this.account = account;
        this.lpBalance = lpBalance;
        this.totalBalance = totalBalance;
        this.token = token;
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
        this.priceUSD = priceUSD;
        this.carbLogo = carbLogo;

        this.showCarbAmount = new BigNumber(lpBalance).div(new BigNumber(10).pow(8)).toNumber();
        const total = new BigNumber(carbAmount);
        const lpShowBalance = new BigNumber(lpBalance).div(new BigNumber(10).pow(8));
        this.showTokenAmount = new BigNumber(lpShowBalance).div(total).multipliedBy(tokenAmount).toNumber();
        const tokenUSD = new BigNumber(this.showTokenAmount).multipliedBy(new BigNumber(token.priceUSD));
        const carbUSD = new BigNumber(this.showCarbAmount).multipliedBy(new BigNumber(priceUSD));
        this.usdShowAmount = tokenUSD.plus(carbUSD).toNumber();
    }
}
