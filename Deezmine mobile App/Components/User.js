import React, {Component} from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import DeezMine from '../img/DeezMine.jpg';
import NfcReader from './NfcReader';
import {Actions} from 'react-native-router-flux';

export default class User extends Component {
  // La premiere étape de la section utilisateur consiste à scanner un tag NFC
  // Si l'utilisateur scan l'instrument, il bascule directement sur instrumentView et verra les infos de l'instrument
  // S'il scan la clé privée cryptée, il lui sera demandé le numéro de série de l'instrument

  constructor(props) {
    super(props);
    this.state = {
      tag: '',
    };
  }

  _goToInstrumentInfo = () => {
    let id = this.state.tag;
    // Si le tag commence en "Ox" nous avons une adresse ethereum
    // potentiellement un instrument enregistré sur la BC
    if (this.state.tag.charAt(0) + this.state.tag.charAt(1) === '0x') {
      Actions.instrumentview({id});
    }
    // Si le tag commence par "U2" nous saurons qu'il est crypté
    else if (this.state.tag.charAt(0) + this.state.tag.charAt(1) === 'U2') {
      Actions.needserialnumber({tag: this.state.tag});
    } else {
      Alert('This Nfc Ship is not recognized');
    }
  };

  render() {
    return (
      <View>
        <Image style={styles.stretch} source={DeezMine} alt="logo" />
        {this.state.tag === '' ? (
          <NfcReader
            style={{marginTop: 310}}
            callBackMajTag={data => {
              this.setState({tag: data});
            }}
          />
        ) : (
          <View>
            <TouchableOpacity
              style={styles.button}
              onPress={this._goToInstrumentInfo}>
              <Text style={styles.buttonText}>Got a Tag !!!</Text>
              <Text style={styles.buttonText}>Let's go to see it !!! </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  stretch: {
    marginLeft: 60,
    width: 240,
    height: 200,
    resizeMode: 'stretch',
    marginTop: 10,
  },
  button: {
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
});
