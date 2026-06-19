// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// ERC-4337 types
struct UserOperation {
    address sender;
    uint256 nonce;
    bytes initCode;
    bytes callData;
    uint256 callGasLimit;
    uint256 verificationGasLimit;
    uint256 preVerificationGas;
    uint256 maxFeePerGas;
    uint256 maxPriorityFeePerGas;
    bytes paymasterAndData;
    bytes signature;
}

enum PostOpMode {
    opSucceeded,
    opReverted,
    postOpReverted
}

interface IPaymaster {
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view returns (bytes memory context, uint256 validationData);

    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external;
}

contract VEILPaymaster is IPaymaster, Ownable, ReentrancyGuard {
    IERC20 public immutable veilToken;
    address public entryPoint;

    // VEIL balance each sender has deposited to pay for gas
    mapping(address => uint256) public deposits;

    // exchange rate: VEIL per wei (scaled 1e18)
    uint256 public veilPerWei;

    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed sender, uint256 amount);
    event EntryPointUpdated(address indexed entryPoint);
    event RateUpdated(uint256 veilPerWei);

    modifier onlyEntryPoint() {
        require(msg.sender == entryPoint, "VEILPaymaster: not entry point");
        _;
    }

    constructor(
        address initialOwner,
        address _veilToken,
        address _entryPoint,
        uint256 _veilPerWei
    ) Ownable(initialOwner) {
        require(_veilToken != address(0), "VEILPaymaster: zero token");
        require(_entryPoint != address(0), "VEILPaymaster: zero entry point");
        veilToken = IERC20(_veilToken);
        entryPoint = _entryPoint;
        veilPerWei = _veilPerWei;
    }

    // Users approve this contract then call deposit to fund gas payments
    function deposit(uint256 veilAmount) external nonReentrant {
        require(veilToken.transferFrom(msg.sender, address(this), veilAmount), "VEILPaymaster: transfer failed");
        deposits[msg.sender] += veilAmount;
        emit Deposited(msg.sender, veilAmount);
    }

    function withdraw(uint256 veilAmount) external nonReentrant {
        require(deposits[msg.sender] >= veilAmount, "VEILPaymaster: insufficient deposit");
        deposits[msg.sender] -= veilAmount;
        require(veilToken.transfer(msg.sender, veilAmount), "VEILPaymaster: transfer failed");
        emit Withdrawn(msg.sender, veilAmount);
    }

    // ERC-4337: called by EntryPoint to validate this paymaster will cover the op
    function validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view override onlyEntryPoint returns (bytes memory context, uint256 validationData) {
        uint256 veilRequired = (maxCost * veilPerWei) / 1e18;
        require(deposits[userOp.sender] >= veilRequired, "VEILPaymaster: insufficient VEIL deposit");
        // validationData 0 = valid, no time range restriction
        return (abi.encode(userOp.sender, veilRequired, userOpHash), 0);
    }

    // ERC-4337: called by EntryPoint after the op executes to settle actual cost
    function postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external override onlyEntryPoint {
        (address sender, , ) = abi.decode(context, (address, uint256, bytes32));
        uint256 veilCost = (actualGasCost * veilPerWei) / 1e18;
        if (deposits[sender] >= veilCost) {
            deposits[sender] -= veilCost;
        } else {
            deposits[sender] = 0;
        }
        // suppress unused param warning
        mode;
    }

    function setEntryPoint(address _entryPoint) external onlyOwner {
        require(_entryPoint != address(0), "VEILPaymaster: zero entry point");
        entryPoint = _entryPoint;
        emit EntryPointUpdated(_entryPoint);
    }

    function setRate(uint256 _veilPerWei) external onlyOwner {
        veilPerWei = _veilPerWei;
        emit RateUpdated(_veilPerWei);
    }

    function rescueTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
