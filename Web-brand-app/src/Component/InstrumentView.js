import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Web3 from "web3";
import deezmineContractABI from "../deezmineContractABI.json";
import { CONTRACT_ADDRESS } from "../config";

export default class InstrumentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.match.params.address,
      brand: "",
      model: "",
      type: "",
      name: "",
      ownerAddress: "",
      ownerNickName: "",
      birthDate: "",
      serialNumber: "",
      isStolenOrLost: false,
      exist: true
    };
  }

  update = async () => {
    const infura = `https://kovan.infura.io/v3/da3c3685867d470b8b9a8a6dffd6ffd0`;
    const web3 = new Web3(new Web3.providers.HttpProvider(infura));
    const deezMine = new web3.eth.Contract(
      deezmineContractABI,
      CONTRACT_ADDRESS
    );

    let exist = await deezMine.methods.getExist(this.state.id).call();

    if (exist) {
      let brand = await deezMine.methods.getBrand(this.state.id).call();
      let model = await deezMine.methods.getModel(this.state.id).call();
      let type = await deezMine.methods.getType(this.state.id).call();
      let name = await deezMine.methods.getName(this.state.id).call();
      let ownerAddress = await deezMine.methods
        .getOwnerAddress(this.state.id)
        .call();
      let ownerNickName = await deezMine.methods
        .getOwnerNickName(this.state.id)
        .call();
      let birthDate = await deezMine.methods.getBirthday(this.state.id).call();
      let serialNumber = await deezMine.methods
        .getSerialNumber(this.state.id)
        .call();
      let isStolenOrLost = await deezMine.methods
        .getIsStolen(this.state.id)
        .call();

      this.setState({
        brand,
        model,
        type,
        name,
        ownerAddress,
        ownerNickName,
        birthDate,
        serialNumber,
        isStolenOrLost
      });
    } else {
      this.setState({ exist: false });
    }
  };

  componentDidMount() {
    this.update();
  }

  render() {
    return (
      <div>
        {this.state.exist ? (
          <div>
            <h1>{this.state.id}</h1>
            <h1>{this.state.brand}</h1>
            <h1>{this.state.model}</h1>
            <h1>{this.state.type}</h1>
            <h1>{this.state.name}</h1>
            <h1>{this.state.ownerAddress}</h1>
            <h1>{this.state.ownerNickName}</h1>
            <h1>{this.state.birthDate}</h1>
            <h1>{this.state.serialNumber}</h1>
          </div>
        ) : (
          <div>
            <h3>There is no intrument for this address</h3>
          </div>
        )}
      </div>
    );
  }
}
