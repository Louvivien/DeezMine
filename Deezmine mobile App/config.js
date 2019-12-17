import deezmineContractABI from './deezmineContractABI.json';
import Web3 from 'web3';

export const CONTRACTADDRESS = '0x96b4f3bb3460861cc3c653f3789245de9eff0ab3';

export const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://kovan.infura.io/v3/da3c3685867d470b8b9a8a6dffd6ffd0`,
  ),
);

export const deezMine = new web3.eth.Contract(
  deezmineContractABI,
  CONTRACTADDRESS,
);
