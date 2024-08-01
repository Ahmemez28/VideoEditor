import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Button,
  FormControl,
  InputGroup,
} from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import Navbar from "./components/Navbar";

function ClipList() {
  const [clips, setClips] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [renameOriginal, setRenameOriginal] = useState(null);
  const [newOriginalName, setNewOriginalName] = useState("");

  useEffect(() => {
    fetchClips();
  }, []);

  const fetchClips = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/clips");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched clips:", data);
      setClips(data);
    } catch (err) {
      console.error("Fetch clips error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOriginal = (originalFilename) => {
    fetch(`http://localhost:3001/api/delete_original/${originalFilename}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then(() => {
        fetchClips(); // Refresh the list after deletion
      })
      .catch((error) => {
        console.error("Delete original error:", error);
      });
  };

  const handleRenameOriginal = (originalFilename) => {
    if (newOriginalName) {
      fetch(`http://localhost:3001/api/rename_original`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_name: originalFilename,
          new_name: newOriginalName,
        }),
      })
        .then((response) => response.json())
        .then(() => {
          setRenameOriginal(null);
          setNewOriginalName("");
          fetchClips(); // Refresh the list after renaming
        })
        .catch((error) => {
          console.error("Rename original error:", error);
        });
    }
  };

  if (loading) {
    return (
      <Typography variant="h6" className="text-light">
        Loading...
      </Typography>
    );
  }

  if (error) {
    return (
      <Typography variant="h6" className="text-light">
        Error: {error}
      </Typography>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Row className="justify-content-center align-items-center w-100">
        <Col xs={12} md={10} lg={8}>
          <Card className="bg-secondary text-light w-100">
            <Card.Body>
              <Box mt={4}>
                <Typography variant="h6">Clips</Typography>
                <ListGroup>
                  {Object.keys(clips).map((originalFilename) => (
                    <ListGroup.Item
                      key={originalFilename}
                      className="bg-dark text-light d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <Link
                          to={`/clips/${originalFilename}`}
                          className="text-light"
                        >
                          {originalFilename}
                        </Link>
                      </div>
                      <div>
                        <a
                          href={`/clips/${originalFilename}`}
                          className="btn btn-success text-white border mx-1"
                        >
                          Go Watch Clip{" "}
                        </a>

                        {renameOriginal === originalFilename ? (
                          <InputGroup className="mt-2">
                            <FormControl
                              placeholder="New name"
                              value={newOriginalName}
                              onChange={(e) =>
                                setNewOriginalName(e.target.value)
                              }
                            />
                            <Button
                              className="btn btn-dark  border border-white"
                              onClick={() =>
                                handleRenameOriginal(originalFilename)
                              }
                            >
                              Rename
                            </Button>
                          </InputGroup>
                        ) : (
                          <Button
                            className="btn btn-dark text-white border mx-1"
                            onClick={() => setRenameOriginal(originalFilename)}
                          >
                            Rename
                          </Button>
                        )}
                        <Button
                          className="btn btn-danger border mx-1"
                          onClick={() => handleDeleteOriginal(originalFilename)}
                        >
                          Delete
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Button as={Link} to="/" variant="warning" className="mt-3">
                  New Clip
                </Button>
              </Box>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ClipList;
