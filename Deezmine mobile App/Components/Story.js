import React from 'react';
import {View, Text} from 'react-native';

const Story = props => {
  // Composant permettant d'afficher les "stories" de l'instrument
  // Chaque "story" est une chaine de caractères composé de 2 éléments
  // date - evenement
  // séparé par un "=>"
  let story = props.story;
  let splitStory = story.split('=>');

  let date = splitStory[0];
  date = new Date(date * 1000);
  date = date.toDateString();
  let event = splitStory[1];
  return (
    <View>
      <Text>
        {date} : {event}
      </Text>
    </View>
  );
};

export default Story;
