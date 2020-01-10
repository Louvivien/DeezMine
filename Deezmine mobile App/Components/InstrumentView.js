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
import QRCodeScanner from 'react-native-qrcode-scanner';
import CryptoJS from 'react-native-crypto-js';
import Story from './Story';
import Picture from './Picture';

export default class InstrumentView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // On récupère les données du ship NFC via props
      // Si l'utilisateur a scanné l'instrument, Id est renseigné
      // S'il s'agit de la carte NFC qui a été scanné (Clé privée cryptée),
      // nous conservons la clé crypté dans this.state.tag
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
      newOwnerMail: 'contact@deezmine.com', // Mail de base si l'owner n'en renseigne pas
      newOwnerNickname: '',
      newOwnerAddress: '0x0000000000000000000000000000000000000000', // Adresse de base si l'owner n'en renseigne pas
      newdata: '',
      wait: false,
      event: '',
      numberOfStories: 0,
      stories: [],
      numberOfPictures: 0,
      pictures: [],
      qrcodeReader: false,
    };
  }

  componentDidMount() {
    // Si l'utilisateur scan la clé privée, il aura accés aux méthodes d'ecriture du smart contract
    this._getData(this.state.id);
    if (this.state.tag) {
      this.setState({canChangeProperties: true});
    }
  }

  _getData = async id => {
    // à l'initianilisation du composant, nous récupérons les données de l'instrument.
    let exist = await deezMine.methods.exist(id).call();

    // Sous condition que l'instrument existe
    if (exist) {
      // On récupère le timestamp de création de l'instrument puis on le transforme en date lisible
      let birthday = await deezMine.methods.birthDateOfInstrument(id).call();
      birthday = new Date(birthday * 1000);
      birthday = birthday.toDateString();

      // Nous récupérons la balance en Ether de l'instrument
      await web3.eth.getBalance(this.state.id, (error, result) => {
        if (error) {
          this.setState({balance: 0});
        } else {
          this.setState({balance: Math.round(result / 1000000000000) / 1000});
        }
      });

      // Nombre de "story" crées sur l'instrument
      let numberOfStories = await deezMine.methods.numberOfStories(id).call();

      // Savoir si l'instrument a été volé ou perdu
      // Cette option est mise en attente pour développement futur
      let isStolen = await deezMine.methods.isStolenOrLost(id).call();

      // Identité de l'instrument et son owner
      let name = await deezMine.methods.name(id).call();
      let ownerAddress = await deezMine.methods.owner(id).call();
      let ownerNickname = await deezMine.methods.ownerNickName(id).call();
      let serialNumber = await deezMine.methods.serialNumber(id).call();
      let ownerMail = await deezMine.methods.ownerMail(id).call();

      // Si l'instrument n'a pas été affilié à un wallet Ethereum,
      // nous envoyons un message afin de suggérer au propriétaire de le faire
      if (
        (ownerAddress == id ||
          ownerAddress === '0x0000000000000000000000000000000000000000') &&
        this.state.tag
      ) {
        Alert.alert(
          'Warning',
          `We suggest you to link your instrument to an ethereum Wallet, ${'\n'}
          For example: metamask on a web browser`,
        );
      }

      //MAJ du state
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

      // On récupère le nombre de photo de l'instrument puis leur HashIPFS dans un tableau
      let numberOfPictures = await deezMine.methods.numberOfPictures(id).call();

      if (numberOfPictures > 0) {
        let pictures = [];
        for (i = 0; i < numberOfPictures; i++) {
          let picture = await deezMine.methods.pictures(id, i).call();
          pictures.push(picture);
        }
        this.setState({numberOfPictures, pictures});
      }

      // Si nous avons des "stories" concernant l'instrument nous les envoyons dans un tableau.
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

  onReadSuccess = e => {
    // Seulement si nous avons scanné une adresse ethereum (commençant par 0x)
    if (e.data.charAt(0) + e.data.charAt(1) === '0x') {
      this.setState({
        newOwnerAddress: e.data,
        qrcodeReader: false,
      });
    }
    // Le QRCode renvoyé par metamask commence par "ethereum:" cette methode le supprime
    // Metamask lorsque nous lui demandons d'afficher le QRcode du wallet affiche ce "ethereum:0x...."
    if (e.data.charAt(0) == 'e' && e.data.charAt(8) == ':') {
      let newOwnerAddress = e.data;
      newOwnerAddress = newOwnerAddress.substr(9);
      this.setState({
        newOwnerAddress,
        qrcodeReader: false,
      });
    }
  };

  takeOwnership = async () => {
    // Création du message d'attente
    this.setState({
      wait: true,
      log: 'build transaction step 1, please Wait ...',
    });

    // estimation du GAS ... Réel problème à l'application,
    // J'ai remarqué qu'il était très changeant
    deezMine.methods
      .takeOwnership(
        this.state.newOwnerMail,
        this.state.newOwnerNickname,
        this.state.newOwnerAddress,
      )
      .estimateGas({from: this.state.id})
      .then(function(gasAmout) {
        console.log(gasAmout);
      });

    // On prévient l'utilisateur que ce qu'il fait à un cout, et qu'il doit être sûr de ce qu'il fait
    Alert.alert(
      'Warning !!!',
      `You will send a transaction to the blockchain. ${'\n'}
      Be sure to know what you do, cause this transaction have a cost. ${'\n'}
      This is what you will send: ${'\n'}
        ${this.state.newOwnerMail} ${'\n'}
        ${this.state.newOwnerNickname} ${'\n'}
        ${this.state.newOwnerAddress} ${'\n'}`,

      [
        {
          text: 'Agree',
          onPress: () => {
            // Construction de la Tx
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
              gas: 300000,
              // Gas estimé , générallement aux alentours des 80 000 mais,
              // je me suis souvent retrouvé avec des echecs de tx donc méthode "bourrin" :300k
              data: tx_builder,
            };
            this.setState({
              log: 'build transaction step 3, please Wait ...',
            });

            //Nous envoyons l'objet tx à la fonction qui signera et enverra la Tx
            this._sendSignedTx(transactionObject);
          },
        },
        {
          // On annule tout si l'utilisateur "disagree" le warning
          text: 'Disagree',
          onPress: () =>
            this.setState({
              wait: false,
              log: 'Waiting for blockchain data...',
            }),
        },
      ],
      {cancelable: false},
    );
  };

  addEvent = () => {
    // Fonction similaire dans son architecture à Takeownership()
    this.setState({
      wait: true,
      log: 'build transaction step 1, please Wait ...',
    });

    Alert.alert(
      'Warning !!!',
      `You will send a transaction to the blockchain. ${'\n'}
      Be sure to know what you do, cause this transaction have a cost. ${'\n'}
      This is what you will send: ${'\n'}
        ${this.state.event}`,
      [
        {
          text: 'Agree',
          onPress: () => {
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
          },
        },
        {
          text: 'Disagree',
          onPress: () =>
            this.setState({
              wait: false,
              log: 'Waiting for blockchain data...',
            }),
        },
      ],
      {cancelable: false},
    );
  };

  _sendSignedTx = async transactionObject => {
    // nous decryptons la clé privée

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
          .sendSignedTransaction(signedTx.rawTransaction, function(
            error,
            result,
          ) {
            if (error) {
              Alert.alert('Error !!!', `${error}`, [
                {
                  text: 'Ok',
                },
              ]);
            } else {
              Alert.alert(
                'Congratulations !!!',
                'This instrument has been updated',
                [
                  {
                    text: 'OK',
                  },
                ],
              );
            }
            console.log(result);
          })
          .then(() => {
            // puis on reload le composant
            this.setState({
              wait: false,
              event: '',
              log: 'Waiting for blockchain data...',
              whatCanIChange: '',
            });
            this._getData(this.state.id);
          });
      });
  };

  render() {
    return (
      <View>
        <ScrollView>
          {this.state.numberOfPictures > 0 ? (
            this.state.pictures.map(picture => {
              return <Picture key={picture} picture={picture} />;
            })
          ) : (
            <View />
          )}

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
                    {Math.round(this.state.balance / 0.2)}
                    Events
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

                  {this.state.ownerAddress ===
                    '0x0000000000000000000000000000000000000000' ||
                  this.state.ownerAddress === this.state.id ? (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        this.setState({whatCanIChange: 'properties'});
                      }}>
                      <Text style={styles.buttonText}>Take ownership ?</Text>
                    </TouchableOpacity>
                  ) : (
                    <View />
                  )}
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
                    placeholder={
                      this.state.newOwnerAddress
                        ? this.state.newOwnerAddress
                        : 'Insert your Ethereum Address (optional)...'
                    }
                    onChangeText={text => {
                      this.setState({newOwnerAddress: text});
                    }}
                    value={this.state.newAddress}
                  />

                  {this.state.qrcodeReader ? (
                    <View>
                      <QRCodeScanner
                        onRead={this.onReadSuccess}
                        cameraStyle={{overflow: 'hidden'}}
                      />
                      <TouchableOpacity
                        style={styles.buttonTakeOwnership}
                        onPress={() => this.setState({qrcodeReader: false})}>
                        <Text style={styles.buttonText}>
                          CANCEL Qrcode viewer.
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.buttonTakeOwnership}
                      onPress={() => this.setState({qrcodeReader: true})}>
                      <Text style={styles.buttonText}>
                        Activate Qrcode viewer.
                      </Text>
                    </TouchableOpacity>
                  )}

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
