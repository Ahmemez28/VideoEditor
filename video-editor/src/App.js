import React, { useState, useRef } from 'react';
import Dropzone from 'react-dropzone';
import ReactPlayer from 'react-player';
import Slider from 'rc-slider';
import { Container, Row, Col, Button, Card, ListGroup } from 'react-bootstrap';
import { Box, Typography } from '@mui/material';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [videoFileObject, setVideoFileObject] = useState(null);
  const [clipStart, setClipStart] = useState(0);
  const [clipEnd, setClipEnd] = useState(0);
  const [duration, setDuration] = useState(0);
  const [clips, setClips] = useState([]);
  const playerRef = useRef(null);

  const handleDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setVideoFile(URL.createObjectURL(file));
    setVideoFileObject(file);
    console.log('File dropped:', file);
  };

  const handleClip = () => {
    const formData = new FormData();
    formData.append('file', videoFileObject);
    formData.append('start', clipStart);
    formData.append('end', clipEnd);

    console.log('Sending clip info:', { start: clipStart, end: clipEnd });

    fetch('http://localhost:3001/api/split', {
      method: 'POST',
      body: formData
    }).then(response => response.json()).then(data => {
      console.log('Response from backend:', data);
      if (data.url) {
        setClips([...clips, { start: clipStart, end: clipEnd, url: data.url }]);
      } else {
        console.error('Error in response:', data.error);
      }
    }).catch(error => {
      console.error('Fetch error:', error);
    });
  };

  const handleDuration = (duration) => {
    setDuration(duration);
    setClipEnd(duration);
    console.log('Video duration:', duration);
  };

  const handleSliderChange = (value) => {
    setClipStart(value[0]);
    setClipEnd(value[1]);
    console.log('Slider changed:', value);
  };

  return (
    <Container fluid className="bg-dark text-light vh-100">
      <Row className="justify-content-center align-items-center h-100">
        <Col xs={12} md={8} lg={6}>
          <Card className="bg-secondary text-light">
            <Card.Body>
              <Dropzone onDrop={handleDrop}>
                {({ getRootProps, getInputProps }) => (
                  <div {...getRootProps()} className="border border-light p-3 mb-3 text-center">
                    <input {...getInputProps()} />
                    <Typography variant="body1">Drag 'n' drop some files here, or click to select files</Typography>
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
                  />
                  <Box>
                    <Slider
                      range
                      min={0}
                      max={duration}
                      defaultValue={[0, duration]}
                      value={[clipStart, clipEnd]}
                      onChange={handleSliderChange}
                      trackStyle={[{ backgroundColor: '#ffc107' }]}
                      handleStyle={[{ borderColor: '#ffc107' }, { borderColor: '#ffc107' }]}
                      railStyle={{ backgroundColor: '#343a40' }}
                    />
                    <Button variant="warning" className="mt-3" onClick={handleClip}>Create Clip</Button>
                  </Box>
                </div>
              )}
              <Box mt={4}>
                <Typography variant="h6">Clips</Typography>
                <ListGroup>
                  {clips.map((clip, index) => (
                    <ListGroup.Item key={index} className="bg-dark text-light">
                      Start: {clip.start}, End: {clip.end}
                      {clip.url && <div><a href={clip.url} download target="_blank" rel="noopener noreferrer">Download Clip</a></div>}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Box>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
