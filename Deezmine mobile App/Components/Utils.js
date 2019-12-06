import React, {Component} from 'react';
import {View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import NfcWritter from './NfcWritter';

export default class Utils extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
    };
  }

  onSuccess = e => {
    this.setState({
      data: e.data,
    });
  };

  goBack = () => {
    this.setState({data: ''});
  };

  render() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
        {this.state.data == '' ? (
          <QRCodeScanner onRead={this.onSuccess} />
        ) : (
          <NfcWritter
            data={this.state.data}
            returnHome={this.returnHome}
            goBack={this.goBack}
          />
        )}
      </View>
    );
  }
}
