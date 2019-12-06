import React from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import GenerateKeys from "./Component/GenerateKeys";
import Home from "./Component/Home";
import InstrumentView from "./Component/InstrumentView";

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/brandtools" component={GenerateKeys} />
          <Route path="/add/:address" component={InstrumentView} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
