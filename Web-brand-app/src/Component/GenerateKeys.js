import React, { Component } from "react";
import QRCode from "qrcode.react";
import "bootstrap/dist/css/bootstrap.min.css";
import { InputGroup, FormControl } from "react-bootstrap";
import { ipfs, deezMine, web3 } from "../config";
import WaitingPlz from "./WaitingPlz";
import Web3 from "web3";
import CryptoJS from "crypto-js";

class GenerateKeys extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addr: "",
      brand: "",
      model: "",
      type: "",
      serialNumber: "",
      loading: false,
      blockNumber: 0,
      account: "",
      step: 0,
      encryptResult: "",
      buffer: [],
      IPFShash: "",
      photoLog: "Select a picture of instrument (smaller than 1Mo)"
    };
  }

  update = async () => {
    // Nous récuperons l'accompte connecté au navigateur, ainsi que le numéro de block actuel de la blockchain
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    let blockNumber = await web3.eth.getBlockNumber();
    this.setState({ account, blockNumber });
  };

  componentDidMount() {
    this.update();
  }

  keys = () => {
    // Le state est reinitialisé à chaque demande de génération de nouvelles clées
    this.setState({
      addr: "",
      tagInstrument: "",
      brand: "",
      model: "",
      type: "",
      serialNumber: "",
      loading: false,
      blockNumber: 0,
      step: 0,
      encryptResult: "",
      buffer: [],
      IPFShash: "",
      photoLog: "Select a picture of instrument (less than 1Mo)"
    });

    // Création d'un compte ethereum
    let accountCreated = web3.eth.accounts.create(web3.utils.randomHex(32));

    // Afin de ne pas avoir à stocker de clé privée dans le state, nous la cryptons.
    let encryptResult = this._encryptKey(
      accountCreated.privateKey,
      "3e168eb237423628ba0e7f665e86bda7b1d7b2aa91e41cfdb2f40125190c48746aQTSNVWeMm61AJ12Ay8cw=="
    );

    // Stockons la clé cryptée l'adresse et passons à l'étape 2
    let addr = accountCreated.address;
    let tagInstrument = `https://www.deezmine.fr/${addr}`;
    this.setState({
      encryptResult,
      addr,
      tagInstrument,
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
    // nous passons le numéro de série en Majuscule pour que l'utilisateur n'ait pas à se soucier de comment le renseigner.
    serialNumber = serialNumber.toUpperCase();
    this.setState({ serialNumber });
  };

  exportOnBlockchain = async () => {
    let hashIpfs = "empty";
    if (this.state.IPFShash) {
      hashIpfs = this.state.IPFShash;
    }
    let name = `${this.state.brand}-${this.state.model}-${this.state.type}`;
    await deezMine.methods
      .checkInInstrument(
        this.state.brand,
        this.state.model,
        this.state.type,
        name,
        this.state.serialNumber,
        this.state.addr,
        hashIpfs
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
                  addr: "",
                  brand: "",
                  model: "",
                  type: "",
                  serialNumber: "",
                  loading: false,
                  blockNumber: 0,
                  step: 0,
                  encryptResult: "",
                  buffer: [],
                  IPFShash: "",
                  photoLog: "Select a picture of instrument (less than 1Mo)"
                });
              }
            }
          );
        }
      );
  };

  step2 = () => {
    this.setState({ step: 2 });
    // decryptage de la clé privée
    let decrypt = this._decryptKey(
      this.state.encryptResult,
      "3e168eb237423628ba0e7f665e86bda7b1d7b2aa91e41cfdb2f40125190c48746aQTSNVWeMm61AJ12Ay8cw=="
    );
    // encryptage de celle-ci avec le numéro de série
    let encryptResult = this._encryptKey(decrypt, this.state.serialNumber);
    this.setState({ encryptResult });
  };

  step3 = () => {
    // l'app conseille de faire une 2 ème carte NFC avec clé privée
    alert(
      "Make sure to encode another NFC card it will be used if first is lost"
    );
    this.setState({ step: 3 });
  };

  _encryptKey = (_somethingtocrypt, password) => {
    //fonction d'encryptage
    return CryptoJS.AES.encrypt(_somethingtocrypt, password).toString();
  };

  _decryptKey = (_encrypt, password) => {
    // fonction de decryptage
    let decrypt = CryptoJS.AES.decrypt(_encrypt, password);
    return decrypt.toString(CryptoJS.enc.Utf8);
  };

  ipfsUpload = e => {
    // au moment ou la photo est upload dans l'interface, elle est automatiquement envoyée sur IPFS
    e.preventDefault();
    this.setState({ photoLog: "Picture is about to be sent to IPFS" });
    const fichier = e.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(fichier);
    reader.onloadend = () => {
      ipfs.add(Buffer(reader.result), async (error, result) => {
        this.setState({
          IPFShash: result[0].hash,
          photoLog: "Picture is on IPFS"
        });
        console.log(this.state.IPFShash);
      });
    };
  };

  render() {
    return (
      <div className="m-2 bg-light">
        {this.state.loading ? (
          <WaitingPlz />
        ) : (
          <div>
            <div>
              <button className="btn btn-lg btn-dark m-3 " onClick={this.keys}>
                Generate new key
              </button>
            </div>

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
                      <div className="input-group mb-3 ">
                        <div className="input-group-prepend">
                          <span className="input-group-text">Picture</span>
                        </div>
                        <div className="custom-file">
                          <input
                            type="file"
                            className="custom-file-input"
                            onChange={this.ipfsUpload}
                          />

                          <label className="custom-file-label ">
                            {this.state.photoLog}
                          </label>
                        </div>
                      </div>
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
