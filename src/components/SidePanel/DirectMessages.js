import React, { Component } from "react";

//REDUX
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions/index";
//FIREBASE
import firebase from "../../firebase";
//SEMANTIC
import { Menu, Icon } from "semantic-ui-react";

//@d                                                PROPS
//@d	user :: obj
//@d	setPrivateChannel :: fn                     >>>>>    App
//@d    setCurrentChannel :: fn

class DirectMessages extends Component {
  state = {
    activeChannel: "",
    user: this.props.currentUser,
    users: [],
    usersRef: firebase.database().ref("users"),
    connectedRef: firebase.database().ref(".info/connected"),
    presenceRef: firebase.database().ref("presence"),
  };

  componentDidMount() {
    if (this.state.user) {
      this.addListeners(this.state.user.uid);
    }
  }

  componentWillUnmount() {
    this.state.usersRef.off();
    this.state.connectedRef.off();
    this.state.presenceRef.off();
  }

  //@q fn called in componentDidMount
  addListeners = (currentUserUid) => {
    //@q we set an empty array to loadedUsers var
    let loadedUsers = [];
    //@q we enable a listener on child added event for users collection
    this.state.usersRef.on("child_added", (snap) => {
      //@q if current user !== snap.key
      if (currentUserUid !== snap.key) {
        //@q we set snap.val() to a user var
        let user = snap.val();
        //@q we set our user uid to snap.key and user status to offline
        user["uid"] = snap.key;
        user["status"] = "offline";
        //@q we push our user to loadedUsers array
        loadedUsers.push(user);
        //@q finally we set the loadedUsers array to users state array
        this.setState({ users: loadedUsers });
      }
    });

    //@q we enable a listener on value event for connectedRef
    //@q https://firebase.google.com/docs/database/web/offline-capabilities?hl=fr#section-connection-state
    this.state.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        //@q we set the path to the doc of our current user in presence collect to ref var
        const ref = this.state.presenceRef.child(currentUserUid);
        //@q we set this value to true
        ref.set(true);
        //@q on disconnection we remove the doc
        ref.onDisconnect().remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    //@q we enable a listener on child added event for presence collection
    this.state.presenceRef.on("child_added", (snap) => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key);
      }
    });

    this.state.presenceRef.on("child_removed", (snap) => {
      if (currentUserUid !== snap.key) {
        this.addStatusToUser(snap.key, false);
      }
    });
  };

  //@q fn called in addListeners fn
  addStatusToUser = (userId, connected = true) => {
    //@q iterate on users state
    const updatedUsers = this.state.users.reduce((acc, user) => {
      if (user.uid === userId) {
        //@q if user is connected then we set online to user status
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      //@q we concat our users in a new array
      return acc.concat(user);
    }, []);
    //@q we set this new array to users state
    this.setState({ users: updatedUsers });
  };

  //@q fn called in our render fn return true or false
  isUserOnline = (user) => user.status === "online";

  //@q fn called in our render fn
  changeChannel = (user) => {
    const channelId = this.getChannelId(user.uid);
    const channelData = {
      id: channelId,
      name: user.name,
    };
    this.props.setCurrentChannel(channelData);
    this.props.setPrivateChannel(true);
    this.setActiveChannel(user.uid);
  };

  //@q fn called in changeChannel fn
  getChannelId = (userId) => {
    //@q if the currentUser isnt in his own private channel we return userId/currentUserId path
    //@q otherwise we return currentUserId/userId path
    const currentUserId = this.state.user.uid;
    return userId < currentUserId
      ? `${userId}/${currentUserId}`
      : `${currentUserId}/${userId}`;
  };

  setActiveChannel = (userId) => {
    this.setState({ activeChannel: userId });
  };

  render() {
    const { users, activeChannel } = this.state;

    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="mail" /> DIRECT MESSAGES
          </span>{" "}
          ({users.length})
        </Menu.Item>
        {users.map((user) => (
          <Menu.Item
            key={user.uid}
            active={user.uid === activeChannel}
            onClick={() => this.changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={this.isUserOnline(user) ? "green" : "red"}
            />
            @ {user.name}
          </Menu.Item>
        ))}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  DirectMessages
);
