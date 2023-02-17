import { ethers, upgrades } from "hardhat";
import "@nomiclabs/hardhat-etherscan";
async function main() {
  const ADMIN_ADDRESS = "0x2411E5ADe6a0bAAe3b11e77226Ae47c82a4BABa9";

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const DeployHelper = await ethers.getContractFactory("DeployHelper");
  const deployHelper = await DeployHelper.deploy();
  await deployHelper.deployed();

  await (await deployHelper.deployNGI(ADMIN_ADDRESS, deployer.address)).wait();
  const proxyAddress = await deployHelper.proxyAddress();
  console.log("Token address:", proxyAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
