import React from 'react';
import {Router, Scene} from 'react-native-router-flux';
import Home from './Components/Home';
import User from './Components/User';
import Utils from './Components/Utils';
import NfcReader from './Components/NfcReader';
import InstrumentView from './Components/InstrumentView';
import NeedSerialNumber from './Components/NeedSerialNumber';

const Routes = () => (
  <Router>
    <Scene key="root">
      <Scene key="home" component={Home} title="Home" initial={true} />
      <Scene key="user" component={User} title="User" />
      <Scene key="utils" component={Utils} title="Utils" />
      <Scene key="nfcreader" component={NfcReader} title="NfcReader" />
      <Scene
        key="needserialnumber"
        component={NeedSerialNumber}
        title="NeedSerialNumber"
      />
      <Scene
        key="instrumentview"
        component={InstrumentView}
        title="InstrumentView"
      />
    </Scene>
  </Router>
);
export default Routes;
