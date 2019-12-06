import React from 'react';
import {View, Text} from 'react-native';

const Story = props => {
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
