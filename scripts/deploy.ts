const {ethers} = require('hardhat')

async function main(){
    const NGI = await ethers.getContractFactory('GenesisIndex')
    const ngi = await NGI.deploy(['0x6740eDDAfb12903c17720e69520DCF488A481479'])
    await ngi.deployed()
    console.log(ngi.address)
    
    
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  