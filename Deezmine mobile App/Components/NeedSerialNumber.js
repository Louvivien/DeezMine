import React, {Component} from 'react';
import CryptoJS from 'react-native-crypto-js';
import {web3} from '../config';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {Actions} from 'react-native-router-flux';

export default class NeedSerialNumber extends Component {
  state = {
    serialNumber: '',
  };

  submit = () => {
    let tag = this.props.tag;

    let decryptedTag = CryptoJS.AES.decrypt(
      tag,
      this.state.serialNumber.toUpperCase(),
    );

    try {
      let id = web3.eth.accounts.privateKeyToAccount(
        decryptedTag.toString(CryptoJS.enc.Utf8),
      ).address;
      Actions.instrumentview({id, tag});
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'This is not the good serial number ', [
        {
          text: 'retry',
          onPress: () => {
            this.setState({serialNumber: ''});
          },
        },
        {
          text: 'Go Back',
          onPress: () => {
            this.setState({serialNumber: ''});
            Actions.home();
          },
        },
      ]);
    }
  };
  render() {
    return (
      <View>
        <TextInput
          style={{
            height: 40,
            marginLeft: 30,
            marginRight: 30,
            marginTop: 10,
            marginBottom: 10,
            borderColor: 'gray',
            borderWidth: 1,
          }}
          placeholder="What's the serial number of intrument ?"
          onChangeText={text => {
            this.setState({serialNumber: text});
          }}
          value={this.state.serialNumber}
        />
        <TouchableOpacity style={styles.button} onPress={this.submit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    marginLeft: 20,
    marginRight: 20,
    marginBottom: 10,
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
