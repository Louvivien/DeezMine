import Web3 from "web3";
import deezmineContractABI from "./deezmineContractABI.json";

export const CONTRACT_ADDRESS = "0x0df5640b3da3fe9f2740e364c66abb93aeb75476";

export const web3 = new Web3(
  Web3.givenProvider || "kovan.infura.io/v3/da3c3685867d470b8b9a8a6dffd6ffd0"
);
export const deezMine = new web3.eth.Contract(
  deezmineContractABI,
  CONTRACT_ADDRESS
);

const ipfsClient = require("ipfs-http-client");
export const ipfs = ipfsClient({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});
