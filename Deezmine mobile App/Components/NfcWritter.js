import React, {Component} from 'react';
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  View,
} from 'react-native';
import NfcManager, {Ndef, NfcTech} from 'react-native-nfc-manager';

function buildUrlPayload(valueToWrite) {
  return Ndef.encodeMessage([Ndef.uriRecord(valueToWrite)]);
}

export default class Writer extends Component {
  // Composant permettant d'ecrire sur un tag NFC
  // Il faut rajouter  la permission:
  // <uses-permission android:name="android.permission.NFC" />
  // dans android/app/src/ANdroidManifest.xml
  constructor(props) {
    super(props);
    this.state = {
      log: 'Clic on Write',
      data: this.props.data,
    };
  }

  componentDidMount() {
    NfcManager.start();
  }

  componentWillUnmount() {
    this._cleanUp();
  }

  goBack = () => {
    this.props.goBack();
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{marginLeft: 30, marginRight: 30, marginBottom: 50}}>
          Data to write : {this.state.data}
        </Text>
        <TouchableOpacity style={styles.buttonWrite} onPress={this._testNdef}>
          <Text style={styles.buttonText}>Write</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonBack} onPress={this.goBack}>
          <Text style={styles.buttonText}>Another QrCode ??</Text>
        </TouchableOpacity>

        <View style={styles.log}>
          <Text>{this.state.log}</Text>
        </View>
      </SafeAreaView>
    );
  }

  _cleanUp = () => {
    this.setState({
      log: 'Clic on Write again if failed',
    });
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  _testNdef = async () => {
    this.setState({
      log: 'Ready to write, approach Nfc ship to your phone back.',
    });
    try {
      let resp = await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Ready to write some NFC tags!',
      });
      let ndef = await NfcManager.getNdefMessage();
      let bytes = buildUrlPayload(this.state.data);
      await NfcManager.writeNdefMessage(bytes);
      alert('successfully write');
      await NfcManager.setAlertMessageIOS('I got your tag!');
      this._cleanUp();
    } catch (ex) {
      this._cleanUp();
    }
  };
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  buttonWrite: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#9D2235',
  },
  buttonBack: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#006C5B',
  },
  buttonText: {
    color: '#ffffff',
  },
  log: {
    marginTop: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
