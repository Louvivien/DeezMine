import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { deezMine, web3 } from "../config";
import InstrumentView from "./InstrumentView";

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      blockNumber: "",
      numberOfInstrumentIgot: 0,
      myIntruments: []
    };
  }

  componentDidMount() {
    this.update();
  }

  update = async () => {
    // Nous récuperons l'accompte connecté au navigateur, ainsi que le numéro de block actuel de la blockchain
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    let blockNumber = await web3.eth.getBlockNumber();
    this.setState({ account, blockNumber });

    let numberOfInstrumentIgot = await deezMine.methods
      .numberOfInstrumentOwnerGot(account)
      .call();

    let myIntruments = [];
    if (numberOfInstrumentIgot > 0) {
      for (let i = 0; i < numberOfInstrumentIgot; i++) {
        let instrument = await deezMine.methods.ownerOf(account, i).call();
        myIntruments.push(instrument);
      }
    }
    this.setState({ myIntruments, numberOfInstrumentIgot });
  };

  render() {
    return (
      <div>
        <h2>My Intrument(s)</h2>
        {this.state.numberOfInstrumentIgot > 0 ? (
          this.state.myIntruments.map(instrument => {
            return (
              <InstrumentView
                key={instrument}
                instrument={instrument}
                account={this.state.account}
              />
            );
          })
        ) : (
          <div>
            <h3>I've got no instrument</h3>
          </div>
        )}
      </div>
    );
  }
}
