import React, { Component } from "react";
//SEMANTIC
import { Header, Segment, Input, Icon } from "semantic-ui-react";

//@d                         PROPS
//@d    channelName
//@d	numUniqueUsers
//@d 	handleSearchChange                 >>> Messages parent comp
//@d	isPrivateChannel
//@d	handleStar
//@d	isChannelStarred

class MessagesHeader extends Component {
  render() {
    const {
      channelName,
      numUniqueUsers,
      handleSearchChange,
      isPrivateChannel,
      handleStar,
      isChannelStarred,
    } = this.props;
    return (
      <Segment clearing>
        <Header
          fluid="true"
          as="h2"
          floated="left"
          styles={{ marginBottom: 0 }}
        >
          <span>
            {channelName}
            {!isPrivateChannel && (
              <React.Fragment>
                <Icon
                  onClick={handleStar}
                  name={isChannelStarred ? "star" : "star outline"}
                  color={isChannelStarred ? "yellow" : "black"}
                />
                <Header.Subheader>{numUniqueUsers}</Header.Subheader>
              </React.Fragment>
            )}
          </span>
        </Header>
        <Header floated="right">
          <Input
            size="mini"
            icon="search"
            name="searchTerm"
            placeholder="Search Messages"
            onChange={handleSearchChange}
          />
        </Header>
      </Segment>
    );
  }
}

export default MessagesHeader;
