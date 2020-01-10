import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import NfcManager, {
  NfcTech,
  NfcEvents,
  NdefParser,
} from 'react-native-nfc-manager';

export default class NfcReader extends Component {
  // Component permettant de lire le tag NFC
  // Il faut rajouter  la permission:
  // <uses-permission android:name="android.permission.NFC" />
  // dans android/app/src/ANdroidManifest.xml
  constructor(props) {
    super(props);
    this.state = {
      log: 'Clic for scan Nfc',
    };
  }

  componentDidMount() {
    NfcManager.start();
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      NfcManager.setAlertMessageIOS('I got your tag!');
      NfcManager.unregisterTagEvent().catch(() => 0);
    });
  }

  componentWillUnmount() {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    NfcManager.unregisterTagEvent().catch(() => 0);
  }

  _scan = async () => {
    this.setState({log: 'Ready ...'});
    try {
      let tech = Platform.OS === 'ios' ? NfcTech.MifareIOS : NfcTech.NfcA;
      let resp = await NfcManager.requestTechnology(tech, {
        alertMessage: 'Ready to do some custom Mifare cmd!',
      });

      // the NFC uid can be found in tag.id
      let tag = await NfcManager.getTag();
      let payloadArray = tag.ndefMessage[0];
      let text = NdefParser.parseUri(payloadArray);
      let data = text.uri;
      this.props.callBackMajTag(data);

      if (Platform.OS === 'ios') {
        resp = await NfcManager.sendMifareCommandIOS([0x30, 0x00]);
      } else {
        resp = await NfcManager.transceive([0x30, 0x00]);
      }

      this._cleanUp();
    } catch (ex) {
      this._cleanUp();
    }
  };

  _cleanUp = () => {
    NfcManager.cancelTechnologyRequest().catch(() => 0);
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.buttonWrite} onPress={this._scan}>
          <Text style={styles.buttonText}>Read card</Text>
        </TouchableOpacity>

        <View style={styles.log}>
          <Text>{this.state.log}</Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  textInput: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 50,
    textAlign: 'center',
    color: 'black',
  },
  buttonWrite: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'black',
  },
  buttonRead: {
    marginLeft: 20,
    marginRight: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'black',
  },
  buttonText: {
    color: '#ffffff',
  },
  log: {
    marginTop: 30,
    marginLeft: 10,
    marginRight: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
