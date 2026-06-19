// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Allocation (informational — not enforced on-chain):
//   Founding Architect (Ryland): 15%  — 150,000,000 VEIL
//   Vick Perry:                   2.5% —  25,000,000 VEIL
//   Builder_X1:                   2.5% —  25,000,000 VEIL
//   Treasury:                    22%   — 220,000,000 VEIL
//   Ecosystem:                   12%   — 120,000,000 VEIL
//   Investors:                   15%   — 150,000,000 VEIL
//   Community:                   10%   — 100,000,000 VEIL
//   Airdrop:                      8%   —  80,000,000 VEIL
//   Liquidity:                   10%   — 100,000,000 VEIL
//   Team/Advisors Pool:           3%   —  30,000,000 VEIL
contract VEILToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10 ** 18;

    constructor(address initialOwner) ERC20("Veil", "VEIL") Ownable(initialOwner) {
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /// @notice Owner may burn tokens from any address (with allowance) or their own.
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /// @notice Burn tokens from another address using allowance.
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
