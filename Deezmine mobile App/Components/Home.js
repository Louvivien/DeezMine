import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Text,
} from 'react-native';
import DeezMine from '../img/DeezMine.jpg';
import {Actions} from 'react-native-router-flux';

export default class App extends Component {
  // Menu principal 2 bouttons pour 2 sections Utilisateur, et utilitaire pour brand
  goToUser = () => {
    Actions.user();
  };

  goToUtils = () => {
    Actions.utils();
  };

  render() {
    return (
      <View>
        <Image style={styles.stretch} source={DeezMine} alt="logo" />

        <SafeAreaView style={styles.container}>
          <TouchableOpacity style={styles.button} onPress={this.goToUser}>
            <Text style={styles.buttonText}>User </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={this.goToUtils}>
            <Text style={styles.buttonText}>Brand Tools</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
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
