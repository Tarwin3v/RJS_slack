import React, { Component } from "react";
import uuidv4 from "uuid/v4";
//FIREBASE
import firebase from "../../firebase";
//SEMANTIC
import { Segment, Button, Input } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
//COMP
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

//@d                                                      PROPS
//@d messagesRef={messagesRef} :: messagesRef: firebase.database().ref('messages')            >>>>>    Messages parent comp >>>>> App
//@d currentChannel={channel}  :: channel: this.props.currentChannel                       	  >>>>>    Messages  >>>>> App
//@d currentUser={user} :: user: this.props.currentUser                                       >>>>>    Messages  >>>>> App
//@d isPrivateChannel={privateChannel} ::  privateChannel: this.props.isPrivateChannel        >>>>>    Messages  >>>>> App
//@d getMessagesRef={this.getMessagesRef}                                                     >>>>>    Messages

export class MessageForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    typingRef: firebase.database().ref("typing"),
    uploadState: "",
    uploadTask: null,
    percentUploaded: 0,
    message: "",
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    modal: false,
    errors: [],
    emojiPicker: false,
  };

  //@q when our component will unmount we want to cancel the process of uploading file
  componentWillUnmount() {
    if (this.state.uploadTask !== null) {
      this.state.uploadTask.cancel();
      this.setState({ uploadTask: null });
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      errors: [],
    });
  };

  //@q we want to handle the ctrl && return key
  //@q && also set a new child in our typing collection each time a user type something in message input
  handleKeyDown = (event) => {
    if (event.ctrlKey || event.keyCode === 13) {
      this.sendMessage();
    }
    const { message, typingRef, channel, user } = this.state;
    if (message) {
      typingRef.child(channel.id).child(user.uid).set(user.displayName);
    } else {
      typingRef.child(channel.id).child(user.uid).remove();
    }
  };

  //@q handle the toggle of our emoji modal (ref : DEPENDECIES)
  handleTogglePicker = () => {
    this.setState({ emojiPicker: !this.state.emojiPicker });
  };

  handleAddEmoji = (emoji) => {
    //@q pick our message with our smiley in colon format
    const oldMessage = this.state.message;
    //@q create a new message with our colonToUnicode regex function
    const newMessage = this.colonToUnicode(`${oldMessage} ${emoji.colons}`);
    //@q set message state with the new message && close emoji modal
    this.setState({ message: newMessage, emojiPicker: false });
    //@q target our node ref to focus to message input after the emoji modal closing
    setTimeout(() => this.messageInputRef.focus(), 0);
  };

  colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  //@q function to format the message
  //@q append an timestamp property to our message that will be used in our Message comp
  //@q && the user data too
  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: this.state.user.uid,
        name: this.state.user.displayName,
        avatar: this.state.user.photoURL,
      },
    };
    //@q if we have a fileUrl in our message then we create an image property in our message
    if (fileUrl !== null) {
      message["image"] = fileUrl;
      //@q else we create an content property with our user text
    } else {
      message["content"] = this.state.message;
    }
    //@d we return the message object that will be used to persist this messsage in our db
    return message;
  };

  sendMessage = () => {
    const { getMessagesRef } = this.props;
    const { message, channel, typingRef, user } = this.state;
    //@q set loading to true if message state isnt empty
    if (message) {
      this.setState({ loading: true });

      //@q getMessagesRef return us the privateMessagesRef if we are in private channel else return messagesRef for public channel
      //@q https://firebase.google.com/docs/database/admin/save-data
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          //@q at this point we are done so we set loading to false we clean message && errors states
          this.setState({ loading: false, message: "", errors: [] });
          //@q we also remove() our doc in our typing collection
          typingRef.child(channel.id).child(user.uid).remove();
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err),
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" }),
      });
    }
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    //@d this is the final step to persist our message to db
    //@d we select first our pathToUpload who correspond to our current channel id
    //@d && we use push() method because we will persist a list on db && each message will have an specific id
    //@d && finally we set our data in db with our createMessage function with our fileUrl as argument

    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        //@q at this point we are dont we set uploadState state to done
        this.setState({
          uploadState: "done",
        });
      })
      .catch((err) => {
        console.log(err);
        this.setState({
          errors: this.state.errors.concat(err),
        });
      });
  };

  //@q select dynamically the right path for our messages
  getPath = () => {
    if (this.props.isPrivateChannel) {
      return `chat/private/${this.state.channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  //@q uploadFile function used in our FileModal component
  uploadFile = (file, metadata) => {
    const pathToUpload = this.state.channel.id;
    const ref = this.props.getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    //@q https://developer.mozilla.org/en-US/docs/Web/API/Blob
    //@q we set uploadState state to uploading
    //@d https://firebase.google.com/docs/storage/web/upload-files?hl=fr
    //@d https://firebase.google.com/docs/reference/js/firebase.storage.UploadTask
    //@d https://firebase.google.com/docs/reference/js/firebase.storage.UploadTaskSnapshot
    this.setState(
      {
        uploadState: "uploading",
        uploadTask: this.state.storageRef.child(filePath).put(file, metadata),
      },
      () => {
        this.state.uploadTask.on(
          "state_changed",
          (snap) => {
            const percentUploaded = Math.round(
              (snap.bytesTransferred * 100) / snap.totalBytes
            );
            this.setState({ percentUploaded });
          },
          (err) => {
            console.log(err);
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            this.state.uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadUrl) => {
                this.sendFileMessage(downloadUrl, ref, pathToUpload);
              })
              .catch((err) => {
                console.log(err);
                this.setState({
                  errors: this.state.errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  openModal = () => {
    this.setState({ modal: true });
  };
  closeModal = () => {
    this.setState({ modal: false });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
      emojiPicker,
    } = this.state;
    return (
      <React.Fragment>
        <Segment className="message__form">
          <ProgressBar
            uploadState={uploadState}
            percentUploaded={percentUploaded}
          />
          {emojiPicker && (
            <Picker
              set="apple"
              onSelect={this.handleAddEmoji}
              title="Emoji"
              emoji="point_up"
              style={{
                position: "absolute",
                top: "-45vh",
                zIndex: 300,
              }}
            />
          )}

          <Input
            ref={(node) => (this.messageInputRef = node)}
            fluid
            name="message"
            style={{ marginBottom: "0.7em" }}
            label={
              <Button
                icon={emojiPicker ? "close" : "add"}
                content={emojiPicker ? "Close" : null}
                onClick={this.handleTogglePicker}
              />
            }
            labelPosition="left"
            placeholder="Write your message"
            value={message}
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            className={
              errors.some((error) => error.message.includes("message"))
                ? "error"
                : ""
            }
          />

          <Button
            color="yellow"
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
          />

          <FileModal
            modal={modal}
            closeModal={this.closeModal}
            uploadFile={this.uploadFile}
          />
        </Segment>
      </React.Fragment>
    );
  }
}

export default MessageForm;
