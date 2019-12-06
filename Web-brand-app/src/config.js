import Web3 from "web3";
import deezmineContractABI from "./deezmineContractABI.json";

export const CONTRACT_ADDRESS = "0x30ab2b88dc6f4d28eabebd355514e926945e6caa";

export const web3 = new Web3(
  Web3.givenProvider || "kovan.infura.io/v3/da3c3685867d470b8b9a8a6dffd6ffd0"
);
export const deezMine = new web3.eth.Contract(
  deezmineContractABI,
  CONTRACT_ADDRESS
);
