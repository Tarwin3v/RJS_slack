import React from "react";
import moment from "moment";
import { Comment, Image } from "semantic-ui-react";

//@q we test if the message owner is really our currentUser
const isOwnMessage = (message, user) => {
  return message.user.id === user.uid ? "message__self" : "";
};

//@q we check if the message content is an image
const isImage = (message) => {
  return message.hasOwnProperty("image") && !message.hasOwnProperty("content");
};

//@q we use moment the timestamp property of our message to display when the message has been posted
const timeFromNow = (timestamp) => moment(timestamp).fromNow();

//@d message && user props sent back by messages parent comp in displayMessages function
const Message = ({ message, user }) => (
  <Comment>
    <Comment.Avatar src={message.user.avatar} />
    {/* message_self className added if message.user.id === user.uid */}
    <Comment.Content className={isOwnMessage(message, user)}>
      <Comment.Author as="a">{message.user.name}</Comment.Author>
      <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
      {/* if isImage return === true then we display an image comp , else we display the message text content */}
      {isImage(message) ? (
        <Image src={message.image} className="message__image" />
      ) : (
        <Comment.Text>{message.content}</Comment.Text>
      )}
    </Comment.Content>
  </Comment>
);

export default Message;
