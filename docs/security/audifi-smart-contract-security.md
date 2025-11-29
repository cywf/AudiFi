# AudiFi Smart Contract Security Guidelines

**Document Version**: 1.0  
**Date**: 2025-01-15  
**Status**: Design Specification

---

## Executive Summary

This document defines the security guidelines for AudiFi's smart contract ecosystem, including Master Contracts (ERC-721C), Dividend Contracts, Artist Coin (ERC-20), and Mover Advantage logic. It covers security patterns, testing requirements, and audit processes.

---

## 1. Contract Architecture Overview

### 1.1 Contract Ecosystem

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AudiFi Smart Contracts                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    │
│  │ Master Contract │    │Dividend Contract│    │  Artist Coin    │    │
│  │   (ERC-721C)    │───>│    (Revenue)    │    │   (ERC-20)      │    │
│  │                 │    │                 │    │                 │    │
│  │ - NFT Shares    │    │ - Distribution  │    │ - Utility Token │    │
│  │ - Master IPO    │    │ - Claiming      │    │ - Governance    │    │
│  │ - Royalties     │    │ - Accounting    │    │ - Staking       │    │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘    │
│           │                      │                      │              │
│           └──────────────────────┼──────────────────────┘              │
│                                  │                                      │
│                    ┌─────────────▼─────────────┐                       │
│                    │    Mover Advantage        │                       │
│                    │    Royalty Logic          │                       │
│                    │    (10/5/3/1 + Seller)    │                       │
│                    └───────────────────────────┘                       │
│                                                                         │
│  Optional Extensions:                                                   │
│  ┌─────────────────┐    ┌─────────────────┐                            │
│  │  Perks/Passes   │    │    Staking      │                            │
│  │  (ERC-1155C)    │    │    Contract     │                            │
│  └─────────────────┘    └─────────────────┘                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Current Repository State

**Status**: ⚠️ No smart contract code in repository

The repository currently contains only frontend code. Smart contracts need to be developed following these security guidelines.

---

## 2. Security Requirements by Contract

### 2.1 Master Contract (ERC-721C)

**Purpose**: Represent NFT shares of Master IPO revenue

**Security Requirements**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";

/**
 * @title AudiFiMasterNFT
 * @notice Master IPO NFT with enforced royalties and Mover Advantage
 * @dev Security considerations documented inline
 */
contract AudiFiMasterNFT is
    ERC721Upgradeable,
    ERC2981,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    PausableUpgradeable
{
    // TODO: Implement with following security controls:
    // 1. Reentrancy protection on all external calls
    // 2. Access control for admin functions
    // 3. Pausable for emergency situations
    // 4. Upgradeable pattern with proper initialization
    // 5. ERC-2981 royalty standard compliance
}
```

**Key Security Controls**:

| Control | Implementation | Priority |
|---------|----------------|----------|
| Reentrancy Guard | OpenZeppelin ReentrancyGuard | Critical |
| Access Control | Ownable2Step or AccessControl | Critical |
| Pausable | Emergency stop functionality | High |
| Upgrade Safety | UUPS or Transparent Proxy | High |
| Royalty Enforcement | ERC-2981 + Creator Token Standards | High |

### 2.2 Dividend Contract

**Purpose**: Distribute revenue to NFT holders

**Security Requirements**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AudiFiDividendDistributor
 * @notice Distributes revenue to Master NFT holders
 * @dev Critical security: Prevent double-claiming and ensure accurate distribution
 */
contract AudiFiDividendDistributor is
    ReentrancyGuardUpgradeable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    // Epoch-based dividend tracking
    mapping(uint256 => mapping(address => bool)) public hasClaimed;
    mapping(uint256 => uint256) public epochTotalDividends;
    
    // TODO: Implement with following security controls:
    // 1. Epoch-based claiming to prevent double-spend
    // 2. Snapshot-based share calculation
    // 3. Pull-based distribution (claimDividend) vs push
    // 4. Reentrancy protection on claim functions
    // 5. Overflow protection (Solidity 0.8+)
    
    /**
     * @notice Claim dividends for a specific epoch
     * @dev Checks-effects-interactions pattern
     * @param epochId The epoch to claim dividends from
     */
    function claimDividend(uint256 epochId) external nonReentrant whenNotPaused {
        // Check: Verify eligibility
        require(!hasClaimed[epochId][msg.sender], "Already claimed");
        require(epochId <= currentEpoch, "Invalid epoch");
        
        // Effect: Mark as claimed BEFORE transfer
        hasClaimed[epochId][msg.sender] = true;
        
        // Calculate share based on snapshot
        uint256 amount = calculateShare(msg.sender, epochId);
        require(amount > 0, "Nothing to claim");
        
        // Interaction: Transfer funds last
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit DividendClaimed(msg.sender, epochId, amount);
    }
}
```

**Critical Vulnerabilities to Prevent**:

| Vulnerability | Mitigation |
|---------------|------------|
| Double-claiming | Epoch + address tracking, claim before transfer |
| Reentrancy | ReentrancyGuard, checks-effects-interactions |
| Integer overflow | Solidity 0.8+ (built-in) or SafeMath |
| Front-running | Snapshot-based calculations |
| Denial of Service | Pull vs push pattern |

### 2.3 Artist Coin (ERC-20)

**Purpose**: Platform utility token for governance and access

**Security Requirements**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AudiFiArtistCoin
 * @notice Platform utility token
 * @dev Standard ERC-20 with controlled minting
 */
contract AudiFiArtistCoin is
    ERC20,
    ERC20Burnable,
    ERC20Pausable,
    AccessControl
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Maximum supply cap to prevent inflation
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion
    
    // TODO: Implement with following security controls:
    // 1. Role-based access control for minting
    // 2. Supply cap enforcement
    // 3. Pausable for emergencies
    // 4. No arbitrary minting by admin after initial distribution
}
```

### 2.4 Mover Advantage Logic

**Purpose**: Implement 10/5/3/1 royalty distribution to early minters

**Security Requirements**:

```solidity
/**
 * @title MoverAdvantage
 * @notice Distributes royalties to early minters: 10/5/3/1 + seller
 * @dev Must be gas-efficient for resale transactions
 */
library MoverAdvantage {
    struct MoverConfig {
        address firstMinter;   // 10%
        address secondMinter;  // 5%
        address thirdMinter;   // 3%
        address fourthMinter;  // 1%
    }
    
    /**
     * @notice Calculate mover advantage distribution
     * @dev Total: 19% to movers, remaining to seller (less platform fee)
     * @param salePrice The total sale price
     * @return distributions Array of (address, amount) pairs
     */
    function calculateDistribution(
        uint256 salePrice,
        MoverConfig memory movers
    ) internal pure returns (address[] memory, uint256[] memory) {
        // TODO: Implement with following security controls:
        // 1. Handle zero addresses (skip distribution)
        // 2. Prevent rounding errors (use basis points)
        // 3. Ensure total distributions don't exceed salePrice
        // 4. Gas-efficient calculation
    }
}
```

---

## 3. Common Vulnerability Patterns

### 3.1 Vulnerabilities to Check

| ID | Vulnerability | Check |
|----|---------------|-------|
| SWC-107 | Reentrancy | Use ReentrancyGuard, CEI pattern |
| SWC-101 | Integer Overflow/Underflow | Solidity 0.8+ or SafeMath |
| SWC-115 | Authorization Through tx.origin | Never use tx.origin for auth |
| SWC-104 | Unchecked Call Return Value | Check all return values |
| SWC-105 | Unprotected Ether Withdrawal | Access control on withdrawals |
| SWC-106 | Unprotected SELFDESTRUCT | Remove or heavily guard |
| SWC-112 | Delegatecall to Untrusted Callee | Only delegatecall to known contracts |
| SWC-113 | DoS with Failed Call | Use pull pattern, handle failures |
| SWC-116 | Block values as Time Proxy | Don't rely on block.timestamp for precise timing |
| SWC-120 | Weak PRNG | Use Chainlink VRF for randomness |

### 3.2 Secure Patterns to Use

```solidity
// Pattern 1: Checks-Effects-Interactions
function withdraw(uint256 amount) external nonReentrant {
    // CHECKS
    require(balances[msg.sender] >= amount, "Insufficient balance");
    
    // EFFECTS
    balances[msg.sender] -= amount;
    
    // INTERACTIONS
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}

// Pattern 2: Pull over Push
// Instead of: distributeToAll() - can run out of gas
// Use: claimable mapping + claim() function

// Pattern 3: Access Control with Timelock
modifier onlyAfterTimelock(bytes32 operationId) {
    require(
        timelockExpiry[operationId] != 0 &&
        block.timestamp >= timelockExpiry[operationId],
        "Timelock not expired"
    );
    _;
}
```

---

## 4. Testing Requirements

### 4.1 Testing Layers

| Layer | Tools | Coverage Target |
|-------|-------|-----------------|
| Unit Tests | Foundry/Hardhat | 100% lines |
| Integration Tests | Foundry/Hardhat | All contract interactions |
| Fuzzing | Foundry fuzz | Edge cases |
| Invariant Tests | Foundry invariant | Critical invariants |
| Formal Verification | Certora (optional) | Critical functions |

### 4.2 Required Test Cases

```solidity
// test/MasterNFT.t.sol

contract MasterNFTTest is Test {
    // Test: Minting restrictions
    function testOnlyAuthorizedCanMint() public { }
    
    // Test: Royalty configuration
    function testRoyaltyPercentageEnforced() public { }
    function testRoyaltyRecipientCorrect() public { }
    
    // Test: Access control
    function testOnlyOwnerCanPause() public { }
    function testRevert_UnauthorizedPause() public { }
    
    // Test: Reentrancy protection
    function testRevert_ReentrancyAttack() public { }
    
    // Fuzz: Edge cases
    function testFuzz_MintingWithDifferentPrices(uint256 price) public { }
    function testFuzz_RoyaltyCalculation(uint256 salePrice) public { }
}

contract DividendTest is Test {
    // Test: No double-claiming
    function testRevert_DoubleClaim() public { }
    
    // Test: Accurate distribution
    function testCorrectShareCalculation() public { }
    
    // Test: Edge cases
    function testFuzz_ClaimWithVaryingBalances(uint256 balance) public { }
    
    // Invariant: Total claimed never exceeds deposited
    function invariant_TotalClaimedNeverExceedsDeposited() public { }
}
```

### 4.3 Static Analysis

```bash
# Run static analysis before deployment
# Slither
slither contracts/ --exclude-dependencies

# Mythril
myth analyze contracts/MasterNFT.sol

# Solhint
solhint 'contracts/**/*.sol'
```

---

## 5. Audit Requirements

### 5.1 Pre-Audit Checklist

- [ ] All tests passing with 100% coverage
- [ ] Static analysis clean (Slither, Mythril)
- [ ] Documentation complete
- [ ] Admin functions documented
- [ ] Upgrade path documented
- [ ] Known issues listed
- [ ] Gas optimization complete
- [ ] Access control matrix documented

### 5.2 Audit Scope

| Contract | Priority | Minimum Auditors |
|----------|----------|-----------------|
| MasterNFT | Critical | 2 |
| DividendDistributor | Critical | 2 |
| ArtistCoin | High | 1 |
| MoverAdvantage | High | 1 |
| Staking (if applicable) | High | 1 |

### 5.3 Recommended Auditors

1. **Trail of Bits** - Deep expertise in DeFi
2. **OpenZeppelin** - Standards experts
3. **Consensys Diligence** - Comprehensive audits
4. **Spearbit** - Decentralized security research

### 5.4 Post-Audit Process

1. Receive audit report
2. Categorize findings by severity
3. Fix all Critical and High findings
4. Address Medium findings or document exceptions
5. Request re-audit for significant changes
6. Publish audit report (transparency)

---

## 6. Deployment Security

### 6.1 Deployment Checklist

```bash
# Pre-deployment
- [ ] Audit complete and all critical issues fixed
- [ ] Multi-sig wallet configured
- [ ] Timelock deployed and configured
- [ ] All owner/admin addresses are multi-sigs
- [ ] Constructor arguments verified
- [ ] Deployment script tested on testnet
- [ ] Etherscan verification prepared

# Deployment
- [ ] Deploy from secure machine (air-gapped preferred)
- [ ] Verify bytecode matches audited code
- [ ] Initialize all upgradeable contracts
- [ ] Transfer ownership to multi-sig
- [ ] Verify on Etherscan/Polygonscan

# Post-deployment
- [ ] Verify all configurations
- [ ] Test basic operations on mainnet
- [ ] Set up monitoring and alerts
- [ ] Document deployed addresses
- [ ] Update frontend contract addresses
```

### 6.2 Multi-Signature Requirements

| Action | Required Signers | Timelock |
|--------|------------------|----------|
| Upgrade contracts | 3 of 5 | 48 hours |
| Change fee parameters | 2 of 5 | 24 hours |
| Pause contracts | 2 of 5 | None (emergency) |
| Unpause contracts | 3 of 5 | None |
| Add new minter | 3 of 5 | 24 hours |

### 6.3 Deployment Verification

```typescript
// scripts/verify-deployment.ts
async function verifyDeployment() {
  // Verify bytecode hash
  const deployedCode = await provider.getCode(contractAddress)
  const expectedHash = ethers.utils.keccak256(expectedBytecode)
  const actualHash = ethers.utils.keccak256(deployedCode)
  assert(expectedHash === actualHash, "Bytecode mismatch!")
  
  // Verify initialization
  const owner = await contract.owner()
  assert(owner === expectedMultiSig, "Owner not set correctly!")
  
  // Verify parameters
  const royaltyBps = await contract.royaltyBps()
  assert(royaltyBps.eq(expectedRoyaltyBps), "Royalty not set correctly!")
  
  console.log("✅ Deployment verified successfully")
}
```

---

## 7. On-Chain Integration Security

### 7.1 Backend Integration

```typescript
// Secure contract interaction from backend

import { ethers } from 'ethers'

// Use environment variables for sensitive data
const PROVIDER_URL = process.env.WEB3_PROVIDER_URL
const SIGNER_KEY = process.env.CONTRACT_SIGNER_KEY // HSM in production

// Validate contract addresses
const CONTRACT_ADDRESSES = {
  masterNFT: validateAddress(process.env.MASTER_NFT_ADDRESS),
  dividend: validateAddress(process.env.DIVIDEND_ADDRESS),
}

function validateAddress(address: string | undefined): string {
  if (!address || !ethers.utils.isAddress(address)) {
    throw new Error(`Invalid contract address: ${address}`)
  }
  return ethers.utils.getAddress(address) // Checksummed
}

// Error handling for contract calls
async function safeContractCall<T>(
  call: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await call()
  } catch (error) {
    if (error.code === 'CALL_EXCEPTION') {
      // Contract reverted
      logger.error(`Contract revert: ${context}`, {
        reason: error.reason,
        transaction: error.transaction
      })
      throw new ContractError('Transaction reverted', error.reason)
    }
    if (error.code === 'NETWORK_ERROR') {
      // RPC issues
      logger.error(`Network error: ${context}`, error)
      throw new NetworkError('Blockchain network unavailable')
    }
    throw error
  }
}
```

### 7.2 Transaction Monitoring

```typescript
// Monitor for suspicious on-chain activity

interface AlertCondition {
  name: string
  check: (tx: Transaction) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const alertConditions: AlertCondition[] = [
  {
    name: 'Large dividend claim',
    check: (tx) => tx.method === 'claimDividend' && tx.value > THRESHOLD,
    severity: 'medium'
  },
  {
    name: 'Admin function called',
    check: (tx) => ADMIN_FUNCTIONS.includes(tx.method),
    severity: 'high'
  },
  {
    name: 'Contract paused',
    check: (tx) => tx.method === 'pause',
    severity: 'critical'
  },
  {
    name: 'Ownership transfer',
    check: (tx) => tx.method === 'transferOwnership',
    severity: 'critical'
  }
]
```

---

## 8. TODO Items

### Smart Contract Development

```markdown
TODO: Develop Master NFT Contract
- Implement ERC-721C with Creator Token Standards
- Add Mover Advantage royalty logic
- Implement pausable and upgradeable patterns
- Write comprehensive tests

TODO: Develop Dividend Contract
- Implement epoch-based dividend distribution
- Add snapshot functionality for share calculation
- Implement pull-based claiming
- Write fuzz tests for edge cases

TODO: Develop Artist Coin
- Implement ERC-20 with supply cap
- Add role-based minting controls
- Consider governance features
- Write integration tests

TODO: Setup Testing Infrastructure
- Configure Foundry for fuzzing
- Add invariant tests
- Setup CI/CD for automated testing
- Configure gas reporting
```

### Integration

```markdown
TODO: Backend Web3 Integration
- Create contract interaction service
- Implement retry logic for failed transactions
- Add transaction monitoring
- Implement webhook for on-chain events

TODO: Frontend Web3 Integration
- Implement wallet connection (WalletConnect, MetaMask)
- Add transaction signing flow
- Display transaction status
- Handle chain switching
```

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-15 | Security-Agent | Initial specification |

---

*This document should be reviewed and updated as smart contract development progresses.*
