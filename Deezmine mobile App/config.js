import deezmineContractABI from './deezmineContractABI.json';
import Web3 from 'web3';

export const CONTRACTADDRESS = '0x0124e90b9638677fae8e22e4b37f9bfe8c0df326';

export const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://kovan.infura.io/v3/da3c3685867d470b8b9a8a6dffd6ffd0`,
  ),
);

export const deezMine = new web3.eth.Contract(
  deezmineContractABI,
  CONTRACTADDRESS,
);
