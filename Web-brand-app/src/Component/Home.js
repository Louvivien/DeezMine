import React, { Component } from "react";
import DeezMine from "../img/DeezMine.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

class Home extends Component {
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
