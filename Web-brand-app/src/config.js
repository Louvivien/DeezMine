import Web3 from "web3";
import deezmineContractABI from "./deezmineContractABI.json";

export const CONTRACT_ADDRESS = "0xec3ef2395d9e4fc194e9652afb8e4d4493e39938";

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
