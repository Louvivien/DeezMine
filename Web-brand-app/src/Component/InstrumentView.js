import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { InputGroup, FormControl } from "react-bootstrap";
import { deezMine, ipfs } from "../config";
import Picture from "./Picture";
import Story from "./Story";
import WaitingPlz from "./WaitingPlz";

export default class InstrumentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.instrument,
      account: this.props.account,
      loading: false,
      brand: "",
      model: "",
      type: "",
      name: "",
      ownerAddress: "",
      ownerNickName: "",
      birthDate: "",
      serialNumber: "",
      isStolenOrLost: false,
      exist: "true",
      numberOfPictures: 0,
      pictures: [],
      numberOfStories: 0,
      stories: [],
      photoLog: "Select a picture of instrument (smaller than 1Mo)",
      IPFShash: "",
      newStory: "",
      newOwnerAddress: "",
      newOwnerNickname: "",
      newOwnerMail: "contact@deezmine.com",
      stolenDetails: "",
      recoverDetails: ""
    };
  }

  componentDidMount() {
    this.update();
  }

  update = async () => {
    let exist = await deezMine.methods.exist(this.state.id).call();

    if (exist) {
      let brand = await deezMine.methods.brand(this.state.id).call();
      let model = await deezMine.methods.model(this.state.id).call();
      let type = await deezMine.methods.instrumentType(this.state.id).call();
      let name = await deezMine.methods.name(this.state.id).call();
      let ownerAddress = await deezMine.methods.owner(this.state.id).call();
      let ownerNickName = await deezMine.methods
        .ownerNickName(this.state.id)
        .call();
      let birthDate = await deezMine.methods
        .birthDateOfInstrument(this.state.id)
        .call();
      birthDate = new Date(birthDate * 1000);
      birthDate = birthDate.toDateString();
      let serialNumber = await deezMine.methods
        .serialNumber(this.state.id)
        .call();
      let isStolenOrLost = await deezMine.methods
        .isStolenOrLost(this.state.id)
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
        isStolenOrLost,
        photoLog: "Select a picture of instrument (smaller than 1Mo)",
        IPFShash: ""
      });

      let numberOfPictures = await deezMine.methods
        .numberOfPictures(this.state.id)
        .call();

      let pictures = [];
      if (numberOfPictures > 0) {
        for (let i = 0; i < numberOfPictures; i++) {
          let picture = await deezMine.methods
            .pictures(this.state.id, i)
            .call();
          pictures.push(picture);
        }
      }
      this.setState({ numberOfPictures, pictures });

      let numberOfStories = await deezMine.methods
        .numberOfStories(this.state.id)
        .call();
      if (numberOfStories > 0) {
        let stories = [];
        for (let i = 0; i < numberOfStories; i++) {
          let story = await deezMine.methods
            .storieOfInstrument(this.state.id, i)
            .call();
          stories.push(story);
        }
        this.setState({ stories });
      }
    }
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
          photoLog: "Ready !!!"
        });
        console.log(this.state.IPFShash);
      });
    };
  };

  addPicture = async () => {
    if (this.state.photoLog === "Ready !!!") {
      await deezMine.methods
        .addPictureWithWallet(this.state.id, this.state.IPFShash)
        .send({ from: this.state.account }, (e, txHash) => {
          this.setState({ loading: true });
          if (e) {
            alert(e);
          } else {
            alert(
              `Picture is on the Blockchain! transaction hash is :${txHash}`
            );
          }
        });
    } else {
      alert("Please wait for Ready IPFS Status");
    }
    this.setState({ loading: false });
    this.update();
  };

  storyEdit = e => {
    this.setState({ newStory: e.target.value });
  };

  addStory = async () => {
    this.setState({ loading: true });
    await deezMine.methods
      .createStory(this.state.id, this.state.newStory)
      .send({ from: this.state.account }, () => {
        this.setState({ loading: true });
        deezMine.events.allEvents(
          {
            fromBlock: this.state.blockNumber
          },
          (err, event) => {
            if (!err) {
              let story = event.returnValues[2];

              alert(`${this.state.name} got a new story : ${story} `);
              this.setState({
                newStory: "",
                loading: false
              });
            }
          }
        );
      });
  };

  newAddOwnerEdit = e => {
    this.setState({ newOwnerAddress: e.target.value });
  };

  newNickname = e => {
    this.setState({ newOwnerNickname: e.target.value });
  };
  newMail = e => {
    this.setState({ newOwnerMail: e.target.value });
  };

  changeOwner = async () => {
    if (this.state.newOwnerAddress === this.state.ownerAddress) {
      alert("transfer can't be done to the same address of the actual owner");
      this.setState({ newOwnerAddress: "" });
      this.update();
    }
    await deezMine.methods
      .transfer(
        this.state.id,
        this.state.newOwnerAddress,
        this.state.newOwnerNickname,
        this.state.newOwnerMail
      )
      .send({ from: this.state.account }, () => {
        this.setState({ loading: true });
        deezMine.events.allEvents(
          {
            fromBlock: this.state.blockNumber
          },
          (err, event) => {
            if (!err) {
              alert(`Transfer has been registered`);
              this.setState({
                newOwnerAddress: "",
                loading: false
              });
            }
          }
        );
      });
  };

  changeName = async () => {
    await deezMine.methods
      .changeOwnerName(
        this.state.id,
        this.state.newOwnerNickname,
        this.state.newOwnerMail
      )
      .send({ from: this.state.account }, () => {
        this.setState({ loading: true });
        deezMine.events.allEvents(
          {
            fromBlock: this.state.blockNumber
          },
          (err, event) => {
            if (!err) {
              alert(`Transfer has been registered`);
              this.setState({
                newOwnerNickname: "",
                newOwnerMail: "",
                loading: false
              });
            }
          }
        );
      });
  };

  stolenEdit = e => {
    this.setState({ stolenDetails: e.target.value });
  };

  declareStolenOrLost = async () => {
    await deezMine.methods
      .declareStolenOrLost(this.state.id, this.state.stolenDetails)
      .send({ from: this.state.account }, () => {
        this.setState({ loading: true });
        deezMine.events.allEvents(
          {
            fromBlock: this.state.blockNumber
          },
          (err, event) => {
            if (!err) {
              alert(`${this.state.name} has been declared stolen or lost`);
              this.setState({
                stolenDetails: "",
                loading: false
              });
            }
          }
        );
      });
  };

  recoverEdit = e => {
    this.setState({ recoverDetails: e.target.value });
  };
  declarerecovered = async () => {
    await deezMine.methods
      .declareRecover(this.state.id, this.state.recoverDetails)
      .send({ from: this.state.account }, () => {
        this.setState({ loading: true });
        deezMine.events.allEvents(
          {
            fromBlock: this.state.blockNumber
          },
          (err, event) => {
            if (!err) {
              alert(`${this.state.name} has been recovered`);
              this.setState({
                recoverDetails: "",
                loading: false
              });
            }
          }
        );
      });
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          <WaitingPlz />
        ) : this.state.exist ? (
          <div className="col-sm m-2">
            <div className="card bg-light" id="card">
              <h5 className="mt-1">{this.state.name}</h5>
              {this.state.pictures.map(picture => {
                return <Picture key={picture} picture={picture} />;
              })}

              <p className="card-text">
                brand : {this.state.brand} <br />
                model : {this.state.model}
                <br />
                type : {this.state.type}
                <br />
                id : {this.state.id}
                <br />
                owner Address : {this.state.ownerAddress}
                <br />
                owner ownerNickName : {this.state.ownerNickName}
                <br />
                birthdate : {this.state.birthDate}
                <br />
                serial number : {this.state.serialNumber}
                <br />
              </p>
              <ul>
                {this.state.stories.map(story => {
                  return <Story key={story} story={story} />;
                })}
              </ul>
              <div className="card-body">
                <div className="btn btn-group-vertical"></div>
              </div>
              <div className="input-group">
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
              <button
                className="btn btn-block btn-secondary mb-2"
                onClick={this.addPicture}
              >
                Add picture
              </button>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New Story</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.storyEdit} />
              </InputGroup>
              <button
                className="btn btn-block btn-info mb-2"
                onClick={this.addStory}
              >
                Add story
              </button>

              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New owner Nickname</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.newNickname} />
              </InputGroup>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New owner Mail</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.newMail} />
              </InputGroup>
              <button
                className="btn btn-block btn-info mb-2"
                onClick={this.changeName}
              >
                Change Owner name and mail
              </button>

              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New owner Address</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.newAddOwnerEdit} />
              </InputGroup>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New owner Nickname</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.newNickname} />
              </InputGroup>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>New owner Mail</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onKeyUp={this.newMail} />
              </InputGroup>
              <button
                className="btn btn-block btn-danger mb-2"
                onClick={this.changeOwner}
              >
                Transfer to another Owner
              </button>
              {this.state.isStolenOrLost ? (
                <div>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>Recover description</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl onKeyUp={this.recoverEdit} />
                  </InputGroup>
                  <button
                    className="btn btn-block btn-success"
                    onClick={this.declarerecovered}
                  >
                    Declare instrument recovered
                  </button>
                </div>
              ) : (
                <div>
                  <InputGroup>
                    <InputGroup.Prepend>
                      <InputGroup.Text>
                        Stolen or lost description
                      </InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl onKeyUp={this.stolenEdit} />
                  </InputGroup>
                  <button
                    className="btn btn-block btn-danger"
                    onClick={this.declareStolenOrLost}
                  >
                    Declare Stolen or lost
                  </button>
                </div>
              )}
            </div>
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
