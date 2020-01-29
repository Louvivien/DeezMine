import React, { Component } from "react";
import DeezMine from "../img/DeezMine.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";
import Web3 from "web3";

class Home extends Component {
  async componentWillMount() {
    this.loadWeb3();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }
  render() {
    return (
      <div className="m-3">
        <div>
          <img src={DeezMine} alt="logo" />
        </div>
        <Link
          to="/brandtools"
          type="button"
          className="btn bg-secondary btn-lg btn-block mx-auto"
        >
          Brand tools
        </Link>
        <Link
          to="/user"
          type="button"
          className="btn bg-secondary btn-lg btn-block mx-auto"
        >
          Users interface
        </Link>
      </div>
    );
  }
}

export default Home;
