import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Story = props => {
  let story = props.story;
  let splitStory = story.split("=>");

  let date = splitStory[0];
  date = new Date(date * 1000);
  date = date.toDateString();
  let event = splitStory[1];
  return (
    <li>
      {date} : {event}
    </li>
  );
};

export default Story;
