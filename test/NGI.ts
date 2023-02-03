import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
import { ICurvePool, IERC20, IWETH, GenesisIndex } from "../typechain-types";
import { any } from "hardhat/internal/core/params/argumentTypes";
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

  // ALL THE PROTOCOLS WORK FINE
  /* describe("Testing Pools", () => {
    let usdcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "0", toEther(100));
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
  }); */

  // returns price of index in USD (18 decimals)
  describe("Price", () => {
    it("Should return correct virtual price", async () => {
      const res : any = await ngi.getVirtualPrice();
      console.log(`${(res / 1e18).toString()} $ `);
    });
  });

  // deposit using the default settings: using USDC
  describe("Deposit default : USDC", async () => {
    let usdcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100)});
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "0", toEther(100));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
    });
    it("No optimization", async () => {
<<<<<<< HEAD
      await ngi.deposit("0", usdcBalance, "0", accounts[0]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
=======
      await ngi.deposit("0", usdcBalance, "0", accounts[0].address);
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 1", async () => {
<<<<<<< HEAD
      await ngi.deposit("0", usdcBalance, "1", accounts[0]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
=======
      await ngi.deposit("0", usdcBalance, "1", accounts[0].address);
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 2", async () => {
<<<<<<< HEAD
      await ngi.deposit("0", usdcBalance, "2", accounts[0]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
=======
      await ngi.deposit("0", usdcBalance, "2", accounts[0].address);
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 3", async () => {
<<<<<<< HEAD
      await ngi.deposit("0", usdcBalance, "3", accounts[0]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
=======
      await ngi.deposit("0", usdcBalance, "3", accounts[0].address);
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 4", async () => {
<<<<<<< HEAD
      await ngi.deposit("0", usdcBalance, "4", accounts[0]);
      const ngiBalance = await ngi.balanceOf(accounts[0].address);
=======
      await ngi.deposit("0", usdcBalance, "4", accounts[0].address);
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  // deposit using the default settings: using WBTC
  describe("Deposit default : WBTC", async () => {
    let wbtcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "1", toEther(100));
      wbtcBalance = await wbtc.balanceOf(accounts[0].address);
      await wbtc.approve(ngi.address, wbtcBalance);
    });
    it("No optimization", async () => {
<<<<<<< HEAD
      await ngi.deposit("1", wbtcBalance, "0", accounts[0]);
=======
      await ngi.deposit("1", wbtcBalance, "0", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 1", async () => {
<<<<<<< HEAD
      await ngi.deposit("1", wbtcBalance, "1", accounts[0]);
=======
      await ngi.deposit("1", wbtcBalance, "1", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 2", async () => {
<<<<<<< HEAD
      await ngi.deposit("1", wbtcBalance, "2", accounts[0]);
=======
      await ngi.deposit("1", wbtcBalance, "2", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 3", async () => {
<<<<<<< HEAD
      await ngi.deposit("1", wbtcBalance, "3", accounts[0]);
=======
      await ngi.deposit("1", wbtcBalance, "3", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 4", async () => {
<<<<<<< HEAD
      await ngi.deposit("1", wbtcBalance, "4", accounts[0]);
=======
      await ngi.deposit("1", wbtcBalance, "4", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  // deposit using the default settings: using WETH
  describe("Deposit default : WETH", async () => {
    let wethBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "2", toEther(100));
      wethBalance = await weth.balanceOf(accounts[0].address);
      await weth.approve(ngi.address, wethBalance);
    });
    it("No optimization", async () => {
<<<<<<< HEAD
      await ngi.deposit("2", wethBalance, "0", accounts[0]);
=======
      await ngi.deposit("2", wethBalance, "0", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 1", async () => {
<<<<<<< HEAD
      await ngi.deposit("2", wethBalance, "1", accounts[0]);
=======
      await ngi.deposit("2", wethBalance, "1", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 2", async () => {
<<<<<<< HEAD
      await ngi.deposit("2", wethBalance, "2", accounts[0]);
=======
      await ngi.deposit("2", wethBalance, "2", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 3", async () => {
<<<<<<< HEAD
      await ngi.deposit("2", wethBalance, "3", accounts[0]);
=======
      await ngi.deposit("2", wethBalance, "3", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });

    it("Optimizer 4", async () => {
<<<<<<< HEAD
      await ngi.deposit("2", wethBalance, "4", accounts[0]);
=======
      await ngi.deposit("2", wethBalance, "4", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  // withdraw using the default settings
  describe("Withdraw default ", async () => {
    let ngiBalance: any;
    beforeEach(async () => {
<<<<<<< HEAD
      await wmatic.deposit({ value: toEther(1) });
      await wmatic.approve(ngi.address, toEther(1));
      await ngi.test_swap(wmatic.address, "0", toEther(1));
      let usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.deposit("0", usdcBalance, "0", accounts[0]);
=======
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "0", toEther(100));
      let usdcBalance: any = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
      await ngi.deposit("0", usdcBalance, "0", accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e

      ngiBalance = await ngi.balanceOf(accounts[0].address);
    });

    it("No optimization", async () => {
<<<<<<< HEAD
      await ngi.withdrawUsdc(ngiBalance, "0", accounts[0]);
      const usdcBalance : any = await usdc.balanceOf(accounts[0].address);
=======
      ngiBalance = await ngi.balanceOf(accounts[0].address);
      await ngi.withdrawUsdc(ngiBalance - 500, "0", accounts[0].address);
      const usdcBalance: any = await usdc.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${fromEther(ngiBalance - 500)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 1", async () => {
<<<<<<< HEAD
      await ngi.withdrawUsdc(ngiBalance, "1", accounts[0]);
      const usdcBalance : any = await usdc.balanceOf(accounts[0].address);
=======
      await ngi.withdrawUsdc(ngiBalance - 500, "1", accounts[0].address);
      const usdcBalance: any = await usdc.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${fromEther(ngiBalance - 500)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 2", async () => {
<<<<<<< HEAD
      await ngi.withdrawUsdc(ngiBalance, "2", accounts[0]);
      const usdcBalance : any = await usdc.balanceOf(accounts[0].address);
=======
      await ngi.withdrawUsdc(ngiBalance - 500, "2", accounts[0].address);
      const usdcBalance: any = await usdc.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${fromEther(ngiBalance - 500)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 3", async () => {
<<<<<<< HEAD
      await ngi.withdrawUsdc(ngiBalance, "3", accounts[0]);
      const usdcBalance : any = await usdc.balanceOf(accounts[0].address);
=======
      await ngi.withdrawUsdc(ngiBalance - 500, "3", accounts[0].address);
      const usdcBalance: any = await usdc.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${fromEther(ngiBalance - 500)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });

    it("Optimization 4", async () => {
<<<<<<< HEAD
      await ngi.withdrawUsdc(ngiBalance, "4", accounts[0]);
      const usdcBalance : any = await usdc.balanceOf(accounts[0].address);
=======
      await ngi.withdrawUsdc(ngiBalance - 500, "4", accounts[0].address);
      const usdcBalance: any = await usdc.balanceOf(accounts[0].address);
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      console.log(
        `${fromEther(ngiBalance - 500)} NGI => ${(
          usdcBalance /
          10 ** 6
        ).toString()} USDC `
      );
    });
  });

  // Deposit with custom settings
  describe("Deposit custom : USDC", async () => {
    let usdcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "0", toEther(100));
      usdcBalance = await usdc.balanceOf(accounts[0].address);
      await usdc.approve(ngi.address, usdcBalance);
    });
    it("Should work", async () => {
      await ngi.depositCustom(
        "0",
        usdcBalance,
        [6000, 3000, 700, 200, 100],
<<<<<<< HEAD
        [6000, 3000, 700, 200, 100], accounts[0]
=======
        [6000, 3000, 700, 200, 100],
        accounts[0].address
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      );
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(usdcBalance / 10 ** 6).toString()} USDC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  describe("Deposit custom : WBTC", async () => {
    let wbtcBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "1", toEther(100));
      wbtcBalance = await wbtc.balanceOf(accounts[0].address);
      await wbtc.approve(ngi.address, wbtcBalance);
    });
    it("Should work", async () => {
      await ngi.depositCustom(
        "1",
        wbtcBalance,
        [6000, 3000, 700, 200, 100],
<<<<<<< HEAD
        [6000, 3000, 700, 200, 100], accounts[0]
=======
        [6000, 3000, 700, 200, 100],
        accounts[0].address
>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      );
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wbtcBalance / 10 ** 8).toString()} WBTC => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

  describe("Deposit custom : WETH", async () => {
    let wethBalance: any;
    beforeEach(async () => {
      await wmatic.deposit({ value: toEther(100) });
      await wmatic.approve(ngi.address, toEther(100));
      await ngi.test_swap(wmatic.address, "2", toEther(100));
      wethBalance = await weth.balanceOf(accounts[0].address);
      await weth.approve(ngi.address, wethBalance);
    });
    it("Should work", async () => {
      await ngi.depositCustom(
        "2",
        wethBalance,
        [6000, 3000, 700, 200, 100],
<<<<<<< HEAD
        [6000, 3000, 700, 200, 100], accounts[0]
=======
        [6000, 3000, 700, 200, 100],
        accounts[0].address

>>>>>>> d97d59cb6bce76eeddba74e00c9e611b4581799e
      );
      const ngiBalance: any = await ngi.balanceOf(accounts[0].address);
      console.log(
        `${(wethBalance / 10 ** 18).toString()} WETH => ${fromEther(
          ngiBalance
        )} NGI`
      );
    });
  });

});
