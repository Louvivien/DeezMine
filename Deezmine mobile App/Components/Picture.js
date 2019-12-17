import React from 'react';
import {Image, StyleSheet} from 'react-native';

const Picture = props => {
  return (
    <Image
      style={styles.stretch}
      source={{
        uri: `https://ipfs.infura.io/ipfs/${props.picture}`,
      }}
      alt="image"
    />
  );
};

const styles = StyleSheet.create({
  stretch: {
    marginLeft: 60,
    width: 240,
    height: 240,
    resizeMode: 'stretch',
    marginTop: 10,
  },
});

export default Picture;
