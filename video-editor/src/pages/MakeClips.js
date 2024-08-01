import React, { useState, useRef } from "react";
import Dropzone from "react-dropzone";
import ReactPlayer from "react-player";
import Slider from "rc-slider";
import { Container, Row, Col, Button, Card, Alert } from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import "../App.css";
import Navbar from "./components/Navbar";

function MakeClips() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileObject, setVideoFileObject] = useState(null);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clipCreated, setClipCreated] = useState(false);
  const [error, setError] = useState(null);
  const playerRef = useRef(null);

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setVideoFile(URL.createObjectURL(file));
    setVideoFileObject(file);
    console.log("File dropped:", file);
    resetUI();
  };

  const handleClip = () => {
    if (!videoFileObject) {
      setError("Please select a video file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", videoFileObject);
    formData.append("start", clipStart);
    formData.append("end", clipEnd);

    console.log("Sending clip info:", { start: clipStart, end: clipEnd });

    fetch("http://localhost:3001/api/split", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from backend:", data);
        if (data.url) {
          setClipCreated(true);
          setError(null);
        } else {
          setError(data.error || "Failed to create clip.");
        }
      })
      .catch((error) => {
        console.error("Fetch error:", error);
        setError("An error occurred while creating the clip.");
      });
  };

  const handleDuration = (duration) => {
    setDuration(duration);
    setClipEnd(duration);
    console.log("Video duration:", duration);
  };

  const handleSliderChange = (value) => {
    setClipStart(value[0]);
    setClipEnd(value[1]);
    console.log("Slider changed:", value);
  };

  const resetUI = () => {
    setClipCreated(false);
    setClipStart(0);
    setClipEnd(duration);
    setError(null);
  };

  return (
    <div className="bg-dark text-light vh-100">
      <Navbar />
      <Container fluid className="d-flex flex-column justify-content-center align-items-center h-100">
        <Row className="justify-content-center align-items-center w-100">
          <Col xs={12} md={10} lg={8}>
            <Card className="bg-secondary text-light w-100">
              <Card.Body>
                <Dropzone onDrop={handleDrop}>
                  {({ getRootProps, getInputProps }) => (
                    <div
                      {...getRootProps()}
                      className="border border-light p-3 mb-3 text-center"
                    >
                      <input {...getInputProps()} />
                      <Typography variant="body1">
                        Drag 'n' drop some files here, or click to select files
                      </Typography>
                    </div>
                  )}
                </Dropzone>
                {videoFile && (
                  <div>
                    <ReactPlayer
                      ref={playerRef}
                      url={videoFile}
                      controls
                      onDuration={handleDuration}
                      className="mb-3"
                      width="100%"
                    />
                    <Box>
                      <Slider
                        range
                        min={0}
                        max={duration}
                        defaultValue={[0, duration]}
                        value={[clipStart, clipEnd]}
                        onChange={handleSliderChange}
                        trackStyle={[{ backgroundColor: "#ffc107" }]}
                        handleStyle={[
                          { borderColor: "#ffc107" },
                          { borderColor: "#ffc107" },
                        ]}
                        railStyle={{ backgroundColor: "#343a40" }}
                      />
                      <Button
                        variant="warning"
                        className="mt-3"
                        onClick={handleClip}
                      >
                        Create Clip
                      </Button>
                      {clipCreated && (
                        <Alert variant="success" className="mt-3">
                          Clip created successfully!
                        </Alert>
                      )}
                      {error && (
                        <Alert variant="danger" className="mt-3">
                          {error}
                        </Alert>
                      )}
                    </Box>
                  </div>
                )}
                <Box mt={4}>
                  <Button as={Link} to="/clips" variant="warning" className="mt-3">Back to Clips</Button>
                </Box>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default MakeClips;
