import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Carousel, Button, FormControl, InputGroup } from 'react-bootstrap';
import { Box, Typography } from '@mui/material';
import ReactPlayer from 'react-player';
import Navbar from "./components/Navbar";
function VideoClips() {
  const { filename } = useParams();
  const [clips, setClips] = useState([]);
  const [renameClipId, setRenameClipId] = useState(null);
  const [newClipName, setNewClipName] = useState('');

  useEffect(() => {
    fetchClips();
  }, [filename]);

  const fetchClips = () => {
    fetch('http://localhost:3001/api/clips')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched clips:', data);
        setClips(data[filename] || []);
      })
      .catch(error => {
        console.error('Fetch clips error:', error);
      });
  };

  const handleDeleteClip = (clipId) => {
    fetch(`http://localhost:3001/api/delete_clip/${clipId}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(() => {
        fetchClips(); // Refresh the list after deletion
      })
      .catch(error => {
        console.error('Delete clip error:', error);
      });
  };

  const handleRenameClip = (clipId) => {
    if (newClipName) {
      fetch(`http://localhost:3001/api/rename_clip/${clipId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_name: newClipName })
      })
        .then(response => response.json())
        .then(() => {
          setRenameClipId(null);
          setNewClipName('');
          fetchClips(); // Refresh the list after renaming
        })
        .catch(error => {
          console.error('Rename clip error:', error);
        });
    }
  };

  const handleDeleteOriginal = () => {
    fetch(`http://localhost:3001/api/delete_original/${filename}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(() => {
        window.location.href = '/clips'; // Redirect after deletion
      })
      .catch(error => {
        console.error('Delete original error:', error);
      });
  };

  return (
    <div  className=" App">
    <Navbar />
      <Row className="justify-content-center align-items-center w-100">
        <Col xs={12} md={10} lg={8}>
          <Card className="bg-secondary text-light w-100">
            <Card.Body>
              <Box mt={4}>
                <Typography variant="h6">Clips for {filename}</Typography>
                {clips.length > 0 ? (
                  <Carousel>
                    {clips.map((clip, index) => (
                      <Carousel.Item key={index}>
                        <ReactPlayer
                          url={clip.url}
                          controls
                          width="100%"
                        />
                        <Carousel.Caption>
                          <Typography variant="body1">
                            Start: {clip.start}, End: {clip.end}
                          </Typography>
                          <Button variant="danger" onClick={() => handleDeleteClip(clip.id)}>Delete Clip</Button>
                          {renameClipId === clip.id ? (
                            <InputGroup className="mt-2">
                              <FormControl
                                placeholder="New name"
                                value={newClipName}
                                onChange={(e) => setNewClipName(e.target.value)}
                              />
                              <Button variant="primary" onClick={() => handleRenameClip(clip.id)}>Rename</Button>
                            </InputGroup>
                          ) : (
                            <Button variant="info" onClick={() => setRenameClipId(clip.id)}>Rename Clip</Button>
                          )}
                        </Carousel.Caption>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                ) : (
                  <Typography variant="body1">No clips available for this video.</Typography>
                )}
                <Button as={Link} to="/clips" variant="warning" className="mt-3">Back to All Clips</Button>
                <Button variant="danger" className="mt-3 ml-2" onClick={handleDeleteOriginal}>Delete Original and Clips</Button>
              </Box>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default VideoClips;
