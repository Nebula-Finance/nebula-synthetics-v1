import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ICurvePool, IERC20, IWETH, GenesisIndex } from "../typechain-types";
dotenv.config();

function toEther(n: number) {
  return ethers.utils.parseUnits(n.toString(), "ether");
}
function fromEther(n: any) {
  return ethers.utils.formatEther(n.toString());
}

describe("NGI", function () {
  let ngi: GenesisIndex,
    usdc: IERC20,
    weth: IERC20,
    wbtc: IERC20,
    accounts: any,
    crv: ICurvePool,
    wmatic: IWETH;

  console.log("**POLYGON MAINNET FORK TESTING**");
  beforeEach(async () => {
    const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const WBTC = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
    const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
    const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
    const CRV = "0x3FCD5De6A9fC8A99995c406c77DDa3eD7E406f81";
    accounts = await ethers.getSigners();
    const NGI = await ethers.getContractFactory("GenesisIndex");
    ngi = await NGI.deploy();
    await ngi.deployed();
    usdc = await ethers.getContractAt("IERC20", USDC);
    weth = await ethers.getContractAt("IWETH", WETH);
    wbtc = await ethers.getContractAt("IERC20", WBTC);
    crv = await ethers.getContractAt("ICurvePool", CRV);
    wmatic = await ethers.getContractAt("IWETH", WMATIC);
  });

  describe("Testing Pools", () => {
    let usdcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(0.1) });
      await wmatic.approve(ngi.address, toEther(0.1));
      await ngi.test_swap(wmatic.address, "0", toEther(0.1));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
    });

    it("UNISWAPv3 should work", async () => {
      await ngi.test_uni_v3("0", "1", usdcBalance);
    });

    it("Balancer  should work", async () => {
      await ngi.test_balancer("0", "1", usdcBalance);
    });

    it("Sushiswap should work", async () => {
      await ngi.test_sushi("0", "1", usdcBalance);
    });

    it("Quickswap should work", async () => {
      await ngi.test_quick("0", "1", usdcBalance);
    });

    it("Curve  should work", async () => {
      await ngi.test_curve("0", "1", usdcBalance);
    });
  });

  describe("Price", () => {
    it("Should return correct virtual price", async () => {
      const res: any = await ngi.getVirtualPrice();
      console.log(`${(res / 1e18).toString()} $ `);
    });
  });

  describe("Deposit default", async () => {
    let usdcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(1) });
      await wmatic.approve(ngi.address, toEther(1));
      await ngi.test_swap(wmatic.address, "0", toEther(1));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
    });
    it("No optimization", async () => {
      await ngi.deposit("0", usdcBalance, "0");
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 1", async () => {
      await ngi.deposit("0", usdcBalance, "1");
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 2", async () => {
      await ngi.deposit("0", usdcBalance, "2");
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 3", async () => {
      await ngi.deposit("0", usdcBalance, "3");
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 4", async () => {
      await ngi.deposit("0", usdcBalance, "4");
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  describe("Withdraw default", async () => {
    let ngiBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(1) });
      await wmatic.approve(ngi.address, toEther(1));
      await ngi.test_swap(wmatic.address, "0", toEther(1));
      let usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.deposit("0", usdcBalance, "0");

      ngiBalance = await ngi.balanceOf(accounts[0].address);
      await wmatic.deposit({ value: toEther(1) });
      await wmatic.approve(ngi.address, toEther(1));
      await ngi.test_swap(wmatic.address, "0", toEther(1));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.deposit("0", usdcBalance, "0");
    });
    it("No optimization", async () => {
      await ngi.withdrawUsdc(ngiBalance, "0");
      const usdcBalance = await usdc.balanceOf(accounts[0].address);
      console.log(
        `${fromEther(ngiBalance)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 1", async () => {
      await ngi.withdrawUsdc(ngiBalance, "1");
      const usdcBalance = await usdc.balanceOf(accounts[0].address);
      console.log(
        `${fromEther(ngiBalance)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 2", async () => {
      await ngi.withdrawUsdc(ngiBalance, "2");
      const usdcBalance = await usdc.balanceOf(accounts[0].address);
      console.log(
        `${fromEther(ngiBalance)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 3", async () => {
      await ngi.withdrawUsdc(ngiBalance, "3");
      const usdcBalance = await usdc.balanceOf(accounts[0].address);
      console.log(
        `${fromEther(ngiBalance)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 4", async () => {
      await ngi.withdrawUsdc(ngiBalance, "4");
      const usdcBalance = await usdc.balanceOf(accounts[0].address);
      console.log(
        `${fromEther(ngiBalance)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });
  });

  describe("Deposit custom", () => {
    it("Should get better result than the default option", async () => {
      await wmatic.deposit({ value: toEther(10) });
      await wmatic.approve(ngi.address, toEther(10));
      await ngi.test_swap(wmatic.address, "0", toEther(10));
      let usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.depositCustom("0", [
        usdcBalance * 0.4,
        usdcBalance * 0.4,
        usdcBalance * 0.2,
        usdcBalance * 0.2,
        usdcBalance * 0.1,
      ]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
      await wmatic.deposit({ value: toEther(10) });
      await wmatic.approve(ngi.address, toEther(10));
      await ngi.test_swap(wmatic.address, "0", toEther(10));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.deposit("0", usdcBalance, "0");
      const ngiBalanceAfter = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalanceAfter - ngiBalance
        )} NGI`
      );
    });
  });
  describe("Withdraw custom", () => {
    it("Should get better result than the default option", async () => {});
  });
});
