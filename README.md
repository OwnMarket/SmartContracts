# Chainium Smart Contracts

This repository contains smart contract code for Chainium Token (CHX) and corresponding token sale.

## Contract Hierarchy

![Smart Contract Hierarchy](docs/SmartContractHierarchy.png)

## Setup

Global prerequisites:

```
$ sudo npm install -g truffle
$ sudo npm install -g ethereumjs-testrpc
```

Repository:

```
$ git clone https://github.com/Chainium/SmartContracts.git SmartContracts
$ cd ./SmartContracts/src
$ npm install
```

## Running Tests

Make sure to start fresh instance of TestRPC (see below) before running each test suite.

```
$ truffle test ./test/CHXToken.js
$ truffle test ./test/CHXTokenSale.js
$ truffle test ./test/CHXTokenSaleRefund.js
```

### TestRPC

TestRPC instance can be started using the script `start_testrpc.sh`.

Address | Role
---|---
0xA9490D512812b2ea0dC2063bF496c7129319A6eE | Admin
0x26c9DfF207ED3E98aDb961906F94A3e938DFc11d | Investor 1
0x2fAe4b8aEFab308038ab5f04f447F27EE30f5506 | Investor 2
0x0CAaAf9B56d99839bede55D831Ad8028b1373D9a | Investor 3
0xEe71722eA189E8E578534424126c0157a644c090 | Investor 4
0x226E6426eAc1163a7c57C63c98Aa54AF7FABcd3F | Sale Operator
0xC3133130Ef27Fc9AE86F9B79f99456B4C2566d74 | Founders
0x3441A4154c43fF1ADDaffEde60BBD1f6ef20a1C9 | ICO Costs
0x548615698D8d12e13c402a6D19C1d4F9a3171372 | Reserve Fund
0xaDDb2268d5Ba05a1165FD7dD0F01C3823a9bb935 | Token Refund
0x67A2aa7E9a8C8AAb54d4e30a1471Aa2940D5d259 | Raised Ether
