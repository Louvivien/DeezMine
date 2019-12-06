import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import {web3, deezMine, CONTRACTADDRESS} from '../config';
import CryptoJS from 'react-native-crypto-js';
import Story from './Story';

export default class InstrumentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: this.props.id,
      tag: this.props.tag,
      balance: 0,
      serialNumber: '',
      name: '',
      isStolen: false,
      canChangeProperties: false,
      whatCanIChange: '', // 2 cases {event , properties}
      birthday: 0,
      ownerAddress: '',
      ownerNickname: '',
      ownerMail: '',
      log: 'Waiting for blockchain data...',
      newOwnerMail: 'contact@deezmine.com',
      newOwnerNickname: '',
      newOwnerAddress: this.props.id,
      newdata: '',
      wait: false,
      event: '',
      numberOfStories: 0,
      stories: [],
    };
  }

  componentDidMount() {
    this._getData(this.state.id);
    if (this.state.tag) {
      this.setState({canChangeProperties: true});
    }
  }

  _getData = async id => {
    let exist = await deezMine.methods.exist(id).call();

    if (exist) {
      let birthday = await deezMine.methods.birthDateOfInstrument(id).call();
      birthday = new Date(birthday * 1000);
      birthday = birthday.toDateString();
      await web3.eth.getBalance(this.state.id, (error, result) => {
        if (error) {
          this.setState({balance: 0});
        } else {
          this.setState({balance: Math.round(result / 1000000000000) / 1000});
        }
      });
      let numberOfStories = await deezMine.methods.numberOfStories(id).call();

      let isStolen = await deezMine.methods.isStolenOrLost(id).call();
      let name = await deezMine.methods.name(id).call();
      let ownerAddress = await deezMine.methods.owner(id).call();
      let ownerNickname = await deezMine.methods.ownerNickName(id).call();
      let serialNumber = await deezMine.methods.serialNumber(id).call();
      let ownerMail = await deezMine.methods.ownerMail(id).call();
      this.setState({
        exist,
        birthday,
        isStolen,
        name,
        ownerAddress,
        ownerNickname,
        serialNumber,
        ownerMail,
        numberOfStories,
      });

      if (numberOfStories > 0) {
        let stories = [];
        for (i = 0; i < numberOfStories; i++) {
          let story = await deezMine.methods.storieOfInstrument(id, i).call();
          stories.push(story);
        }
        this.setState({stories});
      }
    } else {
      this.setState({log: 'This instrument is not on the blockchain'});
    }
  };

  takeOwnership = async () => {
    this.setState({
      wait: true,
      log: 'build transaction step 1, please Wait ...',
    });

    // build tx with arguments and encode it
    let tx_builder = deezMine.methods
      .takeOwnership(
        this.state.newOwnerMail,
        this.state.newOwnerNickname,
        this.state.newOwnerAddress,
      )
      .encodeABI();
    this.setState({
      log: 'build transaction step 2, please Wait ...',
    });

    // build tx object
    let transactionObject = {
      from: this.state.id,
      to: CONTRACTADDRESS,
      gas: 110000,
      data: tx_builder,
    };
    this.setState({
      log: 'build transaction step 3, please Wait ...',
    });

    this._sendSignedTx(transactionObject);
  };

  addEvent = () => {
    this.setState({
      wait: true,
      log: 'build transaction step 1, please Wait ...',
    });

    // build tx with arguments and encode it
    let tx_builder = deezMine.methods
      .createStoryWithKey(this.state.event)
      .encodeABI();
    this.setState({
      log: 'build transaction step 2, please Wait ...',
    });

    // build tx object
    let transactionObject = {
      from: this.state.id,
      to: CONTRACTADDRESS,
      gas: 300000,
      data: tx_builder,
    };
    this.setState({
      log: 'build transaction step 3, please Wait ...',
    });

    this._sendSignedTx(transactionObject);
  };

  _sendSignedTx = async transactionObject => {
    // decrypt privkey

    let privKey = CryptoJS.AES.decrypt(
      this.state.tag,
      this.state.serialNumber.toUpperCase(),
    ).toString(CryptoJS.enc.Utf8);

    // sign tx
    web3.eth.accounts
      .signTransaction(transactionObject, privKey)
      .then(signedTx => {
        console.log(signedTx);
        this.setState({wait: true, log: 'Data has been sent, please Wait ...'});

        // and send it
        web3.eth
          .sendSignedTransaction(signedTx.rawTransaction)
          .then(console.log);
        Alert.alert('Congratulations !!!', 'This instrument has been updated', [
          {
            text: 'OK',
            onPress: () => {
              this.setState({wait: false, whatCanIChange: '', event: ''});
              this._getData(this.state.id);
            },
          },
        ]);
      });
  };

  render() {
    return (
      <View>
        <ScrollView>
          {this.state.exist === true && this.state.wait === false ? (
            <View style={{marginLeft: 20, marginRight: 20}}>
              <Text>Name: {this.state.name}</Text>
              <Text>Creation date: {this.state.birthday}</Text>
              <Text>Owner Address: {this.state.ownerAddress}</Text>
              <Text>Owner Nickname: {this.state.ownerNickname}</Text>
              <Text>Serial Number: {this.state.serialNumber}</Text>
              <Text>Owner Mail: {this.state.ownerMail}</Text>
              {this.state.canChangeProperties ? (
                <View>
                  <Text>Balance: {this.state.balance} Finney</Text>
                  <Text>
                    You can create more or less :
                    {Math.round(this.state.balance / 0.1)}
                    Tx
                  </Text>
                </View>
              ) : (
                <View />
              )}
              {this.state.numberOfStories > 0 ? (
                this.state.stories.map(story => {
                  return <Story key={story} story={story} />;
                })
              ) : (
                <View />
              )}

              {this.state.canChangeProperties === true &&
              this.state.whatCanIChange === '' ? (
                <View>
                  <TouchableOpacity
                    style={styles.buttonTakeOwnership}
                    onPress={() => {
                      this.setState({whatCanIChange: 'event'});
                    }}>
                    <Text style={styles.buttonText}>Add event ?</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.setState({whatCanIChange: 'properties'});
                    }}>
                    <Text style={styles.buttonText}>Take ownership ?</Text>
                  </TouchableOpacity>
                </View>
              ) : this.state.canChangeProperties === true &&
                this.state.whatCanIChange === 'properties' ? (
                <View>
                  <TextInput
                    style={{
                      height: 40,
                      marginTop: 10,
                      marginLeft: 30,
                      marginRight: 30,
                      borderColor: 'gray',
                      borderWidth: 1,
                    }}
                    placeholder="Insert your name ..."
                    onChangeText={text => {
                      this.setState({newOwnerNickname: text});
                    }}
                    value={this.state.newOwner}
                  />
                  <TextInput
                    style={{
                      height: 40,
                      marginTop: 10,
                      marginLeft: 30,
                      marginRight: 30,
                      borderColor: 'gray',
                      borderWidth: 1,
                    }}
                    placeholder="Insert your Ethereum Address (optional)..."
                    onChangeText={text => {
                      this.setState({newOwnerAddress: text});
                    }}
                    value={this.state.newAddress}
                  />
                  <TextInput
                    style={{
                      height: 40,
                      marginTop: 10,
                      marginLeft: 30,
                      marginRight: 30,
                      borderColor: 'gray',
                      borderWidth: 1,
                    }}
                    placeholder="Insert your Email (optional)..."
                    onChangeText={text => {
                      this.setState({newOwnerMail: text});
                    }}
                    value={this.state.newMail}
                  />
                  <TouchableOpacity
                    style={styles.buttonTakeOwnership}
                    onPress={this.takeOwnership}>
                    <Text style={styles.buttonText}>Take Ownership !!!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.setState({whatCanIChange: ''});
                    }}>
                    <Text style={styles.buttonText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              ) : this.state.canChangeProperties === true &&
                this.state.whatCanIChange === 'event' ? (
                <View>
                  <TextInput
                    multiline={true}
                    numberOfLines={4}
                    style={{
                      height: 80,
                      marginTop: 10,
                      marginLeft: 30,
                      marginRight: 30,
                      borderColor: 'gray',
                      borderWidth: 1,
                    }}
                    placeholder="Add an event for your instrument"
                    onChangeText={text => {
                      this.setState({event: text});
                    }}
                    value={this.state.event}
                  />
                  <TouchableOpacity
                    style={styles.buttonTakeOwnership}
                    onPress={this.addEvent}>
                    <Text style={styles.buttonText}>
                      Complete this story!!!
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      this.setState({whatCanIChange: ''});
                    }}>
                    <Text style={styles.buttonText}>CANCEL</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View />
              )}
            </View>
          ) : (
            <Text style={{marginTop: 50, marginLeft: 20, marginRight: 20}}>
              {this.state.log}
            </Text>
          )}
        </ScrollView>
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
  buttonTakeOwnership: {
    marginLeft: 20,
    marginRight: 20,
    marginTop: 10,
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
