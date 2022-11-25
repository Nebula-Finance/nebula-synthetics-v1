import { ethers } from "hardhat";
import { expect } from "chai";
import * as dotenv from "dotenv";
dotenv.config();

function toEther(n: number) {
  return ethers.utils.parseUnits(n.toString(), "ether");
}
function fromEther(n: number) {
  return ethers.utils.formatEther(n.toString());
}

describe("NGI", function () {
  let ngi: GenesisIndex, usdc: any, weth: any, wbtc: any, accounts: any;
  //printLogo()
  console.log("**POLYGON MAINNET FORK TESTING**");
  beforeEach(async () => {
    const USDC = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174";
    const WBTC = "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6";
    const WETH = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
    accounts = await ethers.getSigners();
    const NGI = await ethers.getContractFactory("GenesisIndex");
    ngi = await NGI.deploy([`${accounts[0].address}`]);
    await ngi.deployed();
    usdc = await ethers.getContractAt("IERC20", USDC);
    weth = await ethers.getContractAt("IWETH", WETH);
    wbtc = await ethers.getContractAt("IERC20", WBTC);
  });

  it("Should give correct virtual price", async function () {
    const virtualPrice = await ngi.getVirtualPrice();
    expect(virtualPrice).to.be.greaterThan(0);
    console.log("VIRTUAL PRICE: ", fromEther(virtualPrice), "$");
  });

  it("Should deposit using usdc", async function () {
    // Get weth
    const tx = await weth.deposit({ value: toEther(100) });
    await tx.wait(1);
    const balance = await weth.balanceOf(accounts[0].address);
    expect(balance).to.be.greaterThan(0);

    // Swap for usdc
    const approval = await weth.approve(ngi.address, toEther(100));
    await approval.wait(1);
    const swap = await ngi.swap("2", "0", toEther(100));
    await swap.wait();
    const usdcBalance = await usdc.balanceOf(accounts[0].address);
    expect(usdcBalance).to.be.greaterThan(0);

    //Perform the deposit
    console.log(
      `DEPOSITTING ${(
        usdcBalance /
        10 ** 6
      ).toString()}  usdc IN NGI WITHOUT OPTIMIZER...`
    );
    const approve = await usdc.approve(ngi.address, usdcBalance.toString());
    await approve.wait();

    const deposit = await ngi.deposit(0, usdcBalance.toString(), "0", false, {
      gasLimit: 30000000,
    });
    await deposit.wait();

    // CHECK BALANCE
    const ngiBalance = await ngi.balanceOf(accounts[0].address);
    expect(ngiBalance).to.be.greaterThan(0);
    console.log("NGI GOT WITHOUT OPTIMIZER : ", fromEther(ngiBalance));
  });

  it("Should deposit using usdc and optimizer", async () => {
    // Get weth
    const tx = await weth.deposit({ value: toEther(100) });
    await tx.wait(1);
    const balance = await weth.balanceOf(accounts[0].address);
    expect(balance).to.be.greaterThan(0);

    // Swap for usdc
    const approval = await weth.approve(ngi.address, toEther(100));
    await approval.wait(1);
    const swap = await ngi.swap("2", "0", toEther(100));
    await swap.wait();
    const usdcBalance = await usdc.balanceOf(accounts[0].address);
    expect(usdcBalance).to.be.greaterThan(0);

    //Perform the deposit
    console.log(
      `DEPOSITTING ${(
        usdcBalance /
        10 ** 6
      ).toString()} usdc IN NGI WITH OPTIMIZER...`
    );
    const approve = await usdc.approve(ngi.address, usdcBalance.toString());
    await approve.wait();

    const deposit = await ngi.deposit(0, usdcBalance.toString(), "1", false, {
      gasLimit: 30000000,
    });
    await deposit.wait();

    // CHECK BALANCE
    const nigiBalancete = await ngi.balanceOf(accounts[0].address);
    expect(nigiBalancete).to.be.greaterThan(0);
    console.log("NGI GOT WITH OPTIMIZER : ", fromEther(nigiBalancete));
  });

  /* t("Should be able to buy NGI with wEth only", async function(){
      const tx = await weth.deposit({value: toEther(1)})
      await tx.wait(1)
      const balance = await weth.balanceOf(accounts[0].address)
      expect(balance).to.be.greaterThan(0)
      await (await weth.approve(ngi.address, balance.toString())).wait()
      console.log(`Depositing ${fromEther(balance)} wETH in NGI...`)
      const withEth = await ngi.deposit('2', balance.toString(), '1', false)
      await withEth.wait()
      const ngiBalance = await ngi.balanceOf(accounts[0].address)
      console.log(`NGI GOT WITH ONLY WETH AND OPTIMIZER:${fromEther(ngiBalance)}`)
      expect(ngiBalance).to.be.greaterThan(0)
     
    })

    it("Should be able to buy NGI with wBtc only", async function(){
      console.log("Previous balance", fromEther(await ngi.balanceOf(accounts[0].address)))
      const tx = await weth.deposit({value: toEther(1)})
      await tx.wait(1)
      const balance = await weth.balanceOf(accounts[0].address)
      await (await weth.approve(ngi.address, balance.toString())).wait()
      await (await ngi.swap('2','1', balance.toString() )).wait()
      const btcBalance = await wbtc.balanceOf(accounts[0].address)
      console.log(`Depositing ${fromEther(btcBalance * (10**10))} wBtc in NGI...`)
      await (await wbtc.approve(ngi.address, btcBalance)).wait()
      const withBtc = await ngi.deposit('1', btcBalance.toString(), '1', false)
      await withBtc.wait()
      const ngiBalance = await ngi.balanceOf(accounts[0].address)
      console.log(`NGI GOT WITH ONLY WBTC AND OPTIMIZER:${fromEther(ngiBalance)}`)
      expect(ngiBalance).to.be.greaterThan(0)
     
    }) */

  /*  it("Should be able to buy NGI with pure Eth only", async function(){
      const withEth = await ngi.deposit('2', toEther(1), false, true, {value: toEther(1)})
      await withEth.wait()
      const ngiBalance = await ngi.balanceOf(accounts[0].address)
      console.log(fromEther(ngiBalance))
      expect(ngiBalance).to.be.greaterThan(0)
     
    }) */
});

/**
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
8888888888888888888888888ZZZZZZ8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
888888888888888888Z2SS2222aa22SSSXXX28888888888888888Z88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
888888888888888ZXS2ZZSri:,.  .,:;7SZaXXXZ888888888887.X8888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888882rX8ZX:.   .::i::.     :7aZ77Z888888888; ;888888888888888888888888888888888888888888888888888888Z::::2888888888888888888888888888888888888888888882::,:Z88888888888888888888888888888888888
88888888888Z;iZ8S,  .iSZ8888888ZS;.   .;Zai788888888; ;888888888888888888888888888888888888888888888888888888Z.   S88888888888888888888888888888888888888888888S   .Z88888888888888888888888888888888888
8888888888a,,Z8S   ,a88888Sri;7a88Z7.   :ZZ,iZ888888; ;888888888888888888888888888888888888888888888888888888Z.   S88888888888888888888888888888888888888888888S   .Z88888888888888888888888888888888888
888888888Z, ;88i   X888888888S, iZ88S    78X ;888888; ;88888S777S82X7r;;r7Xa8888888888888ZSXrr;;r7X2Z88888888Z.   SZ2X7;;;r7X2Z8888888Z7777Z888888888Z7777Z8888S   .Z888888Z2SX7r;;;;rX2Z888888888888888
888888888r  ,Z8X   :a888888888;  S888.   ;8a  288888; ;88888;   ..          ,7Z8888888ZX:.          .iX888888Z.   ,.          .i288888Z    a888888888a    a8888S   .Z88888r             .i28888888888888
888888888,   iZ8X,  .;SZ88ZZSi  :Z88X    28X  r88888; ;88888;    ,;XS22SXi.   :Z888882,   .;XS222Xr:   :a8888Z.    ,;7S222Xr:    ;Z888a    a888888888a    a8888S   .Z88888Zii7XS2aa2S7i.  .X888888888888
888888888,    .XZ8S;,.  ...  ,iS88Z;    r8Z,  r88888; ;88888;   i888888888a,   i8888a.   :2aaaaaaaaa;   ,Z888Z.   78888888888X.   r888a    a888888888a    a8888S   .Z8888888Z2XX777XXSaS.  .a88888888888
888888888;      .;XZ8Za2SS2aZ88aXi.   .X82,   S88888; ;88888;   ;8888888888X   .Z888X                    X888Z.   S88888888888i   :888a    a888888888a    a8888S   .Z8888Zr,                X88888888888
888888888a. ,.      .:i;rrr;i:.     ,7Za;    iZ88888; ;88888;   ;88888888882   .Z888S    :7777777777777772888Z.   S8888888888Z,   i888Z    X888888888a    a8888S   .Z888Z.   :XS2222SX7r.   788888888888
88888888882. .,::,              ,i7aaX:     :Z888888; ;88888;   ;88888888882   .Z8888r    iXaZ888888Z2a888888Z.   iXaZ88888a7.   ,a8888i   .7Z88888ZXi    a8888S   .Z8882    rZ88888ZaXi    r88888888888
88888888888a:    ,i;r7777777XS22S7i,       ;Z8888888; ;88888;   ;88888888882   .Z88888Si.    ..,:,..  .a88888Z.      ..,,,.    .rZ88888Zi     .,,,.       a8888S   .Z88887.   .,,,,..       r88888888888
8888888888888X,        ..,,,..           i2888888888; ;88888r,,,r88888888882,,,,Z8888888ZXri:......,:;7288888Z,,,,rri:.....,irSZ888888888a7i:.....:i7X,,,,a88882,,,:Z88888aXi,......:i7Si,,,788888888888
8888888888888882;.                    :7a88888888888r 7888888888888888888888888888888888888888888888888888888888888888888Z888888888888888888888888888888888888888888888888888888888888888888888888888888
888888888888888888aX;:.          ,:rXZ888888888888888a88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888Zaa2222aa888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888
88888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888888


 */