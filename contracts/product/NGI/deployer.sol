pragma solidity ^0.8.0;
import "./NGI.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "hardhat/console.sol";

//Contract used to deploy NGI

contract DeployHelper{
    address public implementationAddress;
    address public proxyAddress;
    function deployNGI(address admin, address newOwner) public{
        GenesisIndex implementation = new GenesisIndex();
        implementationAddress = address(implementation);
        console.log("IMPLEMENTATION : ", implementationAddress);
        TransparentUpgradeableProxy p = new TransparentUpgradeableProxy( address(implementation),
            admin,
            abi.encodeWithSignature(
                "initialize()"
        ));
        proxyAddress = address(p);
        console.log("PROXY : ", proxyAddress);
        GenesisIndex(proxyAddress).transferOwnership(newOwner);
        console.log("DONE! new owner : ", GenesisIndex(proxyAddress).owner());
       

    }

}