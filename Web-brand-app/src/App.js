import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GenerateKeys from "./Component/GenerateKeys";
import Home from "./Component/Home";
import User from "./Component/User";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/brandtools" component={GenerateKeys} />
          <Route exact path="/user" component={User} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
