import React from "react";
//REDUX
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
//FIREBASE
import firebase from "../../firebase";
//SEMANTIC
import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  Button,
  Label,
} from "semantic-ui-react";

//@d                                                PROPS
//@d	user :: obj
//@d	setPrivateChannel :: fn                     >>>>>    App
//@d    setCurrentChannel :: fn

class Channels extends React.Component {
  state = {
    user: this.props.currentUser,
    activeChannel: "",
    channel: null,
    channels: [],
    channelName: "",
    channelDetails: "",
    channelsRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    typingRef: firebase.database().ref("typing"),
    notifications: [],
    modal: false,
    firstLoad: true,
  };

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.state.channelsRef.off();
    this.state.channels.forEach((channel) => {
      this.state.messagesRef.child(channel.id).off();
    });
  }

  //@q Enable listener on child_added event for channels collection
  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on("child_added", (snap) => {
      //@q we push our new data in our loadedChannels array
      loadedChannels.push(snap.val());
      //@q we use this loadedChannels array to populate our channels state
      //@q && we use a callback function in our setState to set the firstChannel
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      //@q we add our data id to our addNotificationListener to enable notifications listeners on our new channel
      this.addNotificationListener(snap.key);
    });
  };

  //@q Enable listener on value event for messages collection
  addNotificationListener = (channelId) => {
    this.state.messagesRef.child(channelId).on("value", (snap) => {
      //@q if channel state !== null
      if (this.state.channel) {
        //@q we call our handleNotifications fn with snap key injected in addListeners fn
        this.handleNotifications(
          channelId,
          this.state.channel.id,
          this.state.notifications,
          snap
        );
      }
    });
  };

  //@q fn called in addNotificationsListener fn
  //@q with channelId = snap.key  from our addListeners fn
  //@q currentChannelId = this.state.channel.id  from addNotificationsListener fn
  //@q notifications = this.state.notifications from our addNotificationsListener fn
  //@q snap  from our addNotificationsListener fn
  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    //@q we set a lastTotal var to  0
    let lastTotal = 0;

    //@q we create an index var with findIndex method called on notifications array
    //@q we seek the notification element in our notifications array that have an id == to our snap.key
    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );
    //@q if our findIndex mthd find an index
    if (index !== -1) {
      //@q && if our snap.key !== currentChannel id we dont want to enable notifications in our current channel
      if (channelId !== currentChannelId) {
        //@q then we set our lastTotal var to our notifications element total
        lastTotal = notifications[index].total;
        //@q if our count of children is > to our lastTotal var
        if (snap.numChildren() - lastTotal > 0) {
          //@q then we set our count property of our notifications element to the difference of counted childrens && lastTotal var
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      //@q we set to our element lastKnowTotal property the snap.numChildren()
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      //@q if we dont find a notification element in our notifications array
      //@q we create it && push it to our notifications array
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    //@q finally we set our notifications array with our notifications array
    this.setState({ notifications });
  };

  //@q fn called in our displayChannels fn
  getNotificationCount = (channel) => {
    //@q we set a count var to 0
    let count = 0;

    //@q we iterate with forEach mthd on our notifications state array
    this.state.notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        //@q if our notification id match the channel id then we persist our notification.count property to count var
        count = notification.count;
      }
    });
    //@q if count > 0 we send back the count var
    if (count > 0) return count;
  };

  setFirstChannel = () => {
    //@q we create a var with our channels array first element
    const firstChannel = this.state.channels[0];
    //@q if our firstLoad state == true && our channels array isnt empty
    if (this.state.firstLoad && this.state.channels.length > 0) {
      //@q we set our currentChannel global props to our first element of channels array
      this.props.setCurrentChannel(firstChannel);
      //@q we  set our firstChannel as active aswell
      this.setActiveChannel(firstChannel);
      //@q we populate our  channel state with firstChannel
      this.setState({ channel: firstChannel });
    }
    //@q finally we set our firstLoad state value to false , at this point we cant call again our setFirstChannel function without reloading
    this.setState({ firstLoad: false });
  };

  addChannel = () => {
    //@q we deconstruct channelsRef , channelName && Details aswell as user displayName && photoUrl from our state
    const {
      channelsRef,
      channelName,
      channelDetails,
      user: { displayName, photoURL },
    } = this.state;

    //@q we create a key var with our new channel id
    //@q https://firebase.google.com/docs/database/admin/save-data#getting-the-unique-key-generated-by-push
    const key = channelsRef.push().key;

    //@q we create a newChannel var with our key var as id of our object
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: displayName,
        avatar: photoURL,
      },
    };

    //@q we select the right path to our data with our key inject in our child() method
    //@q then we update our data with our newChannel object
    channelsRef
      .child(key)
      .update(newChannel)
      .then(() => {
        //@q we clear our channelName && channelDetails state
        this.setState({ channelName: "", channelDetails: "" });
        //@q we finally close the modal
        this.closeModal();
        console.log("channel added");
      })
      .catch((err) => console.log(err));
  };

  displayChannels = (channels) =>
    //@q our fn to display our channels as Menu items
    //@q we use map to generate a new array of Menu items with our channels array data
    //@q we add to each Menu item an onClick event listener with our changeChannel function as callback
    //@q we also add an active property to our props to highlight our active channel if channel id === activeChannel state
    //@q in front of our Menu item we call our getNotifications count with our channel object as arg
    //@q if our getNotifications fn return a count then we can display a label with the count of notification on the channel
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        #{channel.name}
      </Menu.Item>
    ));

  //@q fn called on our onClick event in our displayChannels fn
  changeChannel = (channel) => {
    //@q we set our active channel to our clicked channel
    this.setActiveChannel(channel);
    //@q we clean our typing collection from our user doc
    this.state.typingRef
      .child(this.state.channel.id)
      .child(this.state.user.uid)
      .remove();
    //@q we clear our notifications from our active channel
    this.clearNotifications();
    //@q we set our currentChannel global props to our new channel
    this.props.setCurrentChannel(channel);
    //@q we set our priveChannel global props to false
    this.props.setPrivateChannel(false);
    //@q we finally populate our channel state with our new channel data
    this.setState({ channel });
  };

  //@q fn called in our changeChannel fn
  clearNotifications = () => {
    //@q we select the index of the notifications state array that match our channel id state
    let index = this.state.notifications.findIndex(
      (notification) => notification.id === this.state.channel.id
    );

    //@q if we find an index
    if (index !== -1) {
      //@q we create an array var with our notifications state array spread in it
      let updatedNotifications = [...this.state.notifications];
      //@q we set our total element property to the lastKnownTotal property of our element in our notifications state array
      updatedNotifications[index].total = this.state.notifications[
        index
      ].lastKnownTotal;
      //@q we reset the count property of our element
      updatedNotifications[index].count = 0;
      //@q && finally we update our notifications state with our updatedNotifications object
      this.setState({ notifications: updatedNotifications });
    }
  };

  //@q fn called in changeChannel && setFirstChannel fn
  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = (event) =>
    this.setState({ [event.target.name]: event.target.value });

  handleSubmit = (event) => {
    event.preventDefault();
    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  //@q check if our channelName && channelDetails arent empty
  isFormValid = ({ channelName, channelDetails }) =>
    channelName && channelDetails;

  render() {
    const { channels, modal } = this.state;

    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  type="text"
                  fluid
                  label="Channel Name"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  type="text"
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" />
              Add
            </Button>
            <Button color="red" inverted onClick={this.closeModal}>
              <Icon name="remove" />
              Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);
