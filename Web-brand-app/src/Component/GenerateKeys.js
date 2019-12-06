import React, { Component } from "react";
import QRCode from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";
import { InputGroup, FormControl } from "react-bootstrap";
import { deezMine, web3 } from "../config";
import WaitingPlz from "./WaitingPlz";
import Web3 from "web3";
import CryptoJS from "crypto-js";

class GenerateKeys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      privKey: "",
      addr: "",
      brand: "",
      model: "",
      type: "",
      serialNumber: "",
      loading: false,
      blockNumber: 0,
      account: "",
      step: 0,
      encryptResult: ""
    };
  }

  update = async () => {
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    let blockNumber = await web3.eth.getBlockNumber();
    this.setState({ account, blockNumber });
  };

  componentDidMount() {
    this.update();
  }

  keys = () => {
    let accountCreated = web3.eth.accounts.create(web3.utils.randomHex(32));
    let privKey = accountCreated.privateKey;
    let addr = accountCreated.address;
    this.setState({
      privKey,
      addr,
      step: 1
    });
  };

  brandEdit = e => {
    this.setState({ brand: e.target.value });
  };

  modelEdit = e => {
    this.setState({ model: e.target.value });
  };

  typeEdit = e => {
    this.setState({ type: e.target.value });
  };

  serialNumberEdit = e => {
    let serialNumber = e.target.value;
    serialNumber = serialNumber.toUpperCase();
    this.setState({ serialNumber });
  };

  exportOnBlockchain = async () => {
    let name = `${this.state.brand}-${this.state.model}-${this.state.type}`;
    await deezMine.methods
      .checkInInstrument(
        this.state.brand,
        this.state.model,
        this.state.type,
        name,
        this.state.serialNumber,
        this.state.addr
      )
      .send(
        { from: this.state.account, value: Web3.utils.toWei("1", "finney") },
        () => {
          this.setState({ loading: true });
          deezMine.events.allEvents(
            {
              fromBlock: this.state.blockNumber
            },
            (err, event) => {
              if (!err) {
                let name = event.returnValues[2];
                let serialNumber = event.returnValues[3];
                alert(`${name} n#:${serialNumber}, has been registered. `);
                this.setState({
                  loading: false,
                  privKey: "",
                  addr: "",
                  brand: "",
                  model: "",
                  type: "",
                  serialNumber: "",
                  loading: false,
                  blockNumber: 0,
                  account: "",
                  step: 0,
                  encryptResult: ""
                });
              }
            }
          );
        }
      );
  };

  step2 = () => {
    this.setState({ step: 2 });
    this._encryptKey();
  };

  step3 = () => {
    alert(
      "Make sure to encode another NFC card it will be used if first is lost"
    );
    this.setState({ step: 3 });
  };

  _encryptKey = () => {
    let encryptResult = CryptoJS.AES.encrypt(
      this.state.privKey,
      this.state.serialNumber
    ).toString();
    this.setState({ encryptResult });
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          <WaitingPlz />
        ) : (
          <div>
            <button className="btn btn-lg btn-dark m-3 " onClick={this.keys}>
              Generate new key
            </button>
            {this.state.privKey === "" ? (
              <div></div>
            ) : this.state.step === 1 ? (
              <div className="container-fluid body-content m-2 bg-light">
                <div className=" block-center row">
                  <div className="col-4">
                    <h5>Scan QRCode Address and export to Instrument</h5>
                  </div>

                  <div className="col-4">
                    <QRCode value={this.state.addr} />
                    <h5 className="card-tittle"> Address</h5>
                  </div>

                  <div className="container-fluid body-content">
                    <div className="center-block">
                      <h4>Infos:</h4>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text>Brand</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl onKeyUp={this.brandEdit} />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text>Model</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl onKeyUp={this.modelEdit} />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text>Type</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl onKeyUp={this.typeEdit} />
                      </InputGroup>
                      <InputGroup className="mb-3">
                        <InputGroup.Prepend>
                          <InputGroup.Text>Serial Number</InputGroup.Text>
                        </InputGroup.Prepend>
                        <FormControl onKeyUp={this.serialNumberEdit} />
                      </InputGroup>
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-lg btn-dark m-3 "
                  onClick={this.step2}
                >
                  Got to Step 2
                </button>
              </div>
            ) : this.state.step === 2 ? (
              <div className="container-fluid body-content m-2 bg-light">
                <div className=" block-center row">
                  <div className="col-4">
                    <h5>Scan QRCode Private Key and export to NFC Card</h5>
                  </div>

                  <div className="col-4">
                    <QRCode value={`${this.state.encryptResult}`} />
                    <h5 className="card-tittle"> Private Key</h5>
                  </div>
                </div>
                <button
                  className="btn btn-lg btn-dark m-3 "
                  onClick={this.step3}
                >
                  Go to step 3
                </button>
              </div>
            ) : this.state.step === 3 ? (
              <div className="container-fluid body-content m-2 bg-light">
                <div className=" block-center row">
                  <div className="col-4">
                    <h5 className="bg-warning">
                      WARNING : for safety, you have to encode another NFC Card.
                    </h5>
                  </div>

                  <div className="col-4">
                    <QRCode value={`${this.state.encryptResult}`} />
                    <h5 className="card-tittle"> Private Key</h5>
                  </div>
                </div>
                <button
                  className="btn btn-lg btn-dark m-3 "
                  onClick={this.exportOnBlockchain}
                >
                  Export On Blockchain
                </button>
              </div>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    );
  }
}

export default GenerateKeys;
