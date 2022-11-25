// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.7;

/// @title Function for getting the current chain ID
contract ChainId {
    /// @dev Gets the current chain ID
    /// @return chainId The current chain ID
    function getChainId() external view returns (uint256 chainId) {
        assembly {
            chainId := chainid()
        }
    }
}
