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
                    grphLogo,
                    share,
                }) {
        this.account = account;
        this.lpBalance = lpBalance;
        this.totalBalance = totalBalance;
        this.token = token;
        this.carbAmount = carbAmount;
        this.tokenAmount = tokenAmount;
        this.priceUSD = priceUSD;
        this.grphLogo = grphLogo;
        this.share = share;

        this.showGrphAmount = new BigNumber(share.grph).toNumber();
        const total = new BigNumber(carbAmount);
        const lpShowBalance = new BigNumber(lpBalance).div(new BigNumber(10).pow(8));
        this.showTokenAmount = new BigNumber(share.token);
        const tokenUSD = new BigNumber(this.showTokenAmount).multipliedBy(new BigNumber(token.priceUSD));
        const grphUSD = new BigNumber(this.showGrphAmount).multipliedBy(new BigNumber(priceUSD));
        this.usdShowAmount = tokenUSD.plus(grphUSD).toNumber();
    }
}
