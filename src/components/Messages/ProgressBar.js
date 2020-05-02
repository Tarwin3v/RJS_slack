import React from "react";
import { Progress } from "semantic-ui-react";

//@d                                   PROPS
//@d  uploadState :: str               >>>>>  MessageForm parent comp
//@d  percentUploaded :: int

const ProgressBar = ({ uploadState, percentUploaded }) =>
  uploadState === "uploading" && (
    <Progress
      className="progress__bar"
      percent={percentUploaded}
      progress
      indicating
      size="medium"
      inverted
    />
  );

export default ProgressBar;
