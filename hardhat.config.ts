import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";
import * as dotenv from "dotenv";
dotenv.config();
import "hardhat-gas-reporter";
/** @type import('hardhat/config').HardhatUserConfig */
const CMCAP_KEY = process.env.COINMARKETCAP_API_KEY;
const key = process.env.ALCHEMY_KEY;
const pKey = process.env.PRIVATE_KEY;
const config: HardhatUserConfig = {
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: CMCAP_KEY,
    token: "MATIC",
  },
  solidity: {
    version: "0.8.7",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  networks: {
    localHost: {
      url: "http://127.0.0.1.7545",
      gas: 2100000,
      gasPrice: 8000000000,
    },

    hardhat: {
      forking: {
        url: `https://polygon-mainnet.g.alchemy.com/v2/${key}`,
      },
    },

    polygon: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${key}`,
      accounts: [pKey],
    },
  },

  etherscan: {
    apiKey: process.env.POLYGONSCAN_KEY,
  },
};

export default config;
