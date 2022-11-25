// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "../../interfaces/AggregatorV3Interface.sol";

contract PriceConsumerNGI {
    AggregatorV3Interface[3] private priceFeeds = [
        AggregatorV3Interface(address(0)),
        AggregatorV3Interface(0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6),
        AggregatorV3Interface(0xF9680D99D6C9589e2a93a78A04A279e509205945)
    ];

    function getLatestPrice(uint256 i) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeeds[i].latestRoundData();
        return uint256(price) * 10**10;
    }
}
