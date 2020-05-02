import React from "react";

//REDUX
import { connect } from "react-redux";
import { setUserPosts } from "../../actions";
//FIREBASE
import firebase from "../../firebase";
//SEMANTIC
import { Segment, Comment } from "semantic-ui-react";
//COMP
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";
import Message from "./Message";
import Typing from "./Typing";
import Skeleton from "./Skeleton";

//@d 					                      PROPS
//@d currentChannel :: obj
//@d currentUser :: obj							>>>>>     App
//@d isPrivateChannel :: bool

class Messages extends React.Component {
  state = {
    privateChannel: this.props.isPrivateChannel,
    privateMessagesRef: firebase.database().ref("privateMessages"),
    messagesRef: firebase.database().ref("messages"),
    messages: [],
    messagesLoading: true,
    channel: this.props.currentChannel,
    isChannelStarred: false,
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
    numUniqueUsers: "",
    searchTerm: "",
    searchLoading: false,
    searchResults: [],
    typingRef: firebase.database().ref("typing"),
    typingUsers: [],
    //@q https://firebase.google.com/docs/database/web/offline-capabilities?hl=fr
    connectedRef: firebase.database().ref(".info/connected"),
    listeners: [],
  };

  componentDidMount() {
    const { channel, user, listeners } = this.state;

    if (channel && user) {
      this.removeListeners(listeners);
      this.addListeners(channel.id);
      this.addUserStarsListener(channel.id, user.uid);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.messagesEnd) {
      this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }
  }

  componentWillUnmount() {
    this.removeListeners(this.state.listeners);
    this.state.connectedRef.off();
  }

  removeListeners = (listeners) => {
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };
  addToListeners = (id, ref, event) => {
    const index = this.state.listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });

    if (index === -1) {
      const newListener = { id, ref, event };
      this.setState({ listeners: this.state.listeners.concat(newListener) });
    }
  };

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
    this.addTypingListener(channelId);
  };

  //@q Enable listener on child_added event for messages collection && privateMessages
  addMessageListener = (channelId) => {
    let loadedMessages = [];
    //@d https://firebase.google.com/docs/database/admin/retrieve-data#child-added
    //@d child_added is triggered once for each existing child and then again every time a new child is added to the specified path
    //@d The event callback is passed a snapshot containing the new child's data
    const ref = this.getMessagesRef();
    ref.child(channelId).on("child_added", (snap) => {
      //@q we push our new message data in our loadedMessages var
      loadedMessages.push(snap.val());
      //@q we populate the messages state with our loadedMessages array
      //@q && set messagesLoading to false
      this.setState({
        messages: loadedMessages,
        messagesLoading: false,
      });
      //@q in our message structure we have to user who sent the message
      //@q so we cant count the number of unique users in our array of messages
      this.countUniqueUsers(loadedMessages);
      //@q we can also count the number of post by user
      this.countUserPosts(loadedMessages);
    });
    //@q we use our addToListeners function to push our listener cred in our listeners state array
    this.addToListeners(channelId, ref, "child_added");
  };

  //@q Enable event listener on child_added for typing collection
  addTypingListener = (channelId) => {
    let typingUsers = [];
    this.state.typingRef.child(channelId).on("child_added", (snap) => {
      //@d check if it's not our currentUser who is typing
      //@d our typing collection structure ::
      //@d typing {
      //@d	channelId  {
      //@d		userId(snap.key): 'username'
      //@d    }
      //@d }

      if (snap.key !== this.state.user.uid) {
        typingUsers = typingUsers.concat({
          id: snap.key,
          name: snap.val(),
        });

        this.setState({ typingUsers });
      }
    });
    //@q we use our addToListeners function to push our listener cred in our listeners state array
    this.addToListeners(channelId, this.state.typingRef, "child_added");

    //@q Enable event listener on child_removed for typing collection
    this.state.typingRef.child(channelId).on("child_removed", (snap) => {
      //@q check if user.id === snap.key && if true then persist the index of the user in our typingUsers array
      const index = typingUsers.findIndex((user) => user.id === snap.key);
      //@q if user exist in our array
      if (index !== -1) {
        //@q we filter out the specific user from our array
        typingUsers = typingUsers.filter((user) => user.id !== snap.key);
        //@q && we set our new array as typingUsers state
        this.setState({ typingUsers });
      }
    });

    //@q we add evenly this listener to our listeners state by addToListeners fn
    this.addToListeners(channelId, this.state.typingRef, "child_removed");

    //@q Enable event listener on value for presence collection

    this.state.connectedRef.on("value", (snap) => {
      //@d check our doc value is true
      //@d our presence collection structure ::
      //@d presence {
      //@d
      //@d		{userId(snap.key): true(snap.val())},
      //@d    {userId(snap.key): true(snap.val())}
      //@d    }
      //@d
      //@q if snap.val() === true
      //@d && we clear data of the user from the typing collection on disconnect event
      if (snap.val() === true) {
        this.state.typingRef
          .child(channelId)
          .child(this.state.user.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) {
              console.log(err);
            }
          });
      }
    });
  };

  //@q Enable event listener on value for users collection
  //@d https://firebase.google.com/docs/database/admin/retrieve-data#value
  addUserStarsListener = (channelId, userId) => {
    this.state.usersRef
      .child(userId)
      .child("starred")
      .once("value")
      .then((data) => {
        if (data.val() !== null) {
          const channelIds = Object.keys(data.val());
          const prevStarred = channelIds.includes(channelId);
          this.setState({ isChannelStarred: prevStarred });
        }
      });
  };

  getMessagesRef = () => {
    const { messagesRef, privateMessagesRef, privateChannel } = this.state;
    return privateChannel ? privateMessagesRef : messagesRef;
  };

  //@q enable or disable the starred feature on channels by inverting isChannelStarred state on each click
  handleStar = () => {
    this.setState(
      (prevState) => ({
        isChannelStarred: !prevState.isChannelStarred,
      }),
      () => this.starChannel()
    );
  };

  //@d our starred document structure ::
  //@d "starred" ; {
  //@d	  "channelId" : {
  //@d           "createdBy" : {user},
  //@d		   "details"  : {description text},
  //@d		   "name"    : { WorkStation}
  //@d                  }
  //@d              }
  //@q we update our user document with the new starred channel
  starChannel = () => {
    if (this.state.isChannelStarred) {
      this.state.usersRef.child(`${this.state.user.uid}/starred`).update({
        [this.state.channel.id]: {
          name: this.state.channel.name,
          details: this.state.channel.details,
          createdBy: {
            name: this.state.channel.createdBy.name,
            avatar: this.state.channel.createdBy.avatar,
          },
        },
      });
      //@q or we remove the starred channel when isChannelStarred state is false
    } else {
      this.state.usersRef
        .child(`${this.state.user.uid}/starred`)
        .child(this.state.channel.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  handleSearchChange = (event) => {
    this.setState(
      {
        searchTerm: event.target.value,
        searchLoading: true,
      },
      () => this.handleSearchMessages()
    );
  };

  handleSearchMessages = () => {
    //@q we create an array with our channel messages
    const channelMessages = [...this.state.messages];
    //@q https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp
    const regex = new RegExp(this.state.searchTerm, "gi");
    //@q https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/reduce
    //@q the callback function is called for each element in our array

    const searchResults = channelMessages.reduce((acc, message) => {
      //@q if our message content exist && our message content match ou regex based on our searchTerm state
      //@q or the username match our searchTerm
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        //@q then we push our message in our accumulator
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 1000);
  };

  countUniqueUsers = (messages) => {
    //@q here our reducer seek in our messages array state each user missing in our uniqueUsers
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    //@q if uniqueUsers array is empty or have more than one element
    const plural = uniqueUsers.length > 1 || uniqueUsers.length === 0;
    //@q then we have an s at user's' string
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? "s" : ""}`;
    this.setState({ numUniqueUsers });
  };

  //@q quite similar to countUniqueUsers function
  //@q this time we just increment an count property on our user object nested in our message
  countUserPosts = (messages) => {
    let userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1,
        };
      }
      return acc;
    }, {});
    this.props.setUserPosts(userPosts);
  };

  //@q we format each message in our UI and call this function in our render function
  displayMessages = (messages) =>
    messages.length > 0 &&
    messages.map((message) => (
      <Message
        key={message.timestamp}
        message={message}
        user={this.state.user}
      />
    ));
  //@q accept channel :: this.props.currentChannel as argument
  //@q if channel !== null than we have a nested ternary that display @ for a private channel && # for a public channel
  displayChannelName = (channel) => {
    return channel
      ? `${this.state.privateChannel ? "@" : "#"}${channel.name}`
      : "";
  };

  displayTypingUsers = (typingUsers) => {
    typingUsers.length > 0 &&
      typingUsers.map((user) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "0.2em",
          }}
          key={user.id}
        >
          <span className="user__typing">{user.name}</span>
          <Typing />
        </div>
      ));
  };

  displayMessagesSkeleton = (loading) =>
    loading ? (
      <React.Fragment>
        {[...Array(14)].map((_, i) => (
          <Skeleton key={i} />
        ))}
      </React.Fragment>
    ) : null;

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading,
      privateChannel,
      isChannelStarred,
      typingUsers,
      messagesLoading,
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
          isPrivateChannel={privateChannel}
          handleStar={this.handleStar}
          isChannelStarred={isChannelStarred}
        />

        <Segment className="messages">
          <Comment.Group>
            {this.displayMessagesSkeleton(messagesLoading)}
            {searchTerm
              ? this.displayMessages(searchResults)
              : this.displayMessages(messages)}
            {this.displayTypingUsers(typingUsers)}
            <div
              ref={(node) => {
                this.messagesEnd = node;
              }}
            />
          </Comment.Group>
        </Segment>

        <MessageForm
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isPrivateChannel={privateChannel}
          getMessagesRef={this.getMessagesRef}
        />
      </React.Fragment>
    );
  }
}

export default connect(null, { setUserPosts })(Messages);
