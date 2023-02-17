// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../interfaces/AggregatorV3Interface.sol";

contract PriceConsumerNGI {
    
    AggregatorV3Interface[3]  priceFeeds;
    function getLatestPrice(uint256 i) internal view returns (uint256) {
        (, int256 price,,,) = priceFeeds[i].latestRoundData();
        return uint256(price) * 10 ** 10;
    }
}
