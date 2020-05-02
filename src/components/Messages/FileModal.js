import React, { Component } from "react";
import mime from "mime-types";
//SEMANTIC
import { Modal, Input, Button, Icon } from "semantic-ui-react";

//@d                                        PROPS
//@d modal :: bool
//@d closeModal :: fn                      >>>>> MessageForm
//@d uploadFile :: fn

class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"],
  };
  //@q function triggered by a change event on our file input
  addFile = (event) => {
    event.preventDefault();
    //@q we persist in a variable our file
    const file = event.target.files[0];
    if (file) {
      //@q we set this file data as file state
      this.setState({ file });
    }
  };

  sendFile = () => {
    //@q we get our file data from our state
    const { file } = this.state;
    //@q we get our 2 functions built in our parent comp from props
    const { uploadFile, closeModal } = this.props;
    if (file !== null) {
      if (this.isAuthorized(file.name)) {
        //@q if we have file data and the file name is included in our authorized array then we can start to proceed
        //@q we create a metadata variable
        const metadata = {
          contentType: mime.lookup(file.name),
        };
        uploadFile(file, metadata);
        //@q after the upload we close modal and clear our file state
        closeModal();
        this.setState({ file: null });
      }
    }
  };

  isAuthorized = (filename) =>
    this.state.authorized.includes(mime.lookup(filename));

  render() {
    //@q we deconstruct modal && closeModal from our props object
    const { modal, closeModal } = this.props;
    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input onChange={this.addFile} fluid name="file" type="file" />
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" inverted onClick={this.sendFile}>
            <Icon name="checkmark" />
            Send
          </Button>
          <Button color="red" inverted onClick={closeModal}>
            <Icon name="remove" />
            Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;
