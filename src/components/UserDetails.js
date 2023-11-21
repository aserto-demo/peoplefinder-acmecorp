import React, { useState, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import { Container, Row, Col, InputGroup, FormControl, Modal } from 'react-bootstrap'
import { useAuth } from 'oidc-react';

import { useAserto } from '@aserto/aserto-react'
import { Button } from './Button'
import Highlight from './Highlight'
import { LoadingSpinner } from './Loading'
import { useUsers } from '../utils/users'

import config from '../utils/config'
const { apiOrigin = "http://localhost:3001" } = config;

// display state map resource path
const resourcePath = '/api/users/__id';

const attrKey = 'properties';


const UserDetails = withRouter(({ user, setUser, loadUser, history }) => {
  const dexAuth = useAuth();
  const { getDisplayState, identity, reload } = useAserto();
  const { users, loadUsers } = useUsers();
  const [showDetail, setShowDetail] = useState(false);
  const [editing, setEditing] = useState(false);   // edit phone property
  const [updating, setUpdating] = useState(false); // update title and dept properties
  const [phone, setPhone] = useState();
  const [department, setDepartment] = useState();
  const [title, setTitle] = useState();
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true)

  // retrieve the manager name
  const managerId = user && user[attrKey] && user[attrKey].manager;
  const manager = users && managerId && users.find(u => u.id === managerId);
  const managerName = manager && manager.displayName;

  useEffect(() => {
    const reloadDisplayStateMap = async () => {
      setLoading(true);
      await reload(JSON.stringify({
        id: user.id
      }))
      setLoading(false);
    }

    if (user.id) {
      reloadDisplayStateMap();
    }
  }, [reload, user.id])

  useEffect(() => {
    setPhone(user[attrKey].phone || '');
    setDepartment(user[attrKey].department || '');
    setTitle(user[attrKey].title || '');
  }, [user])

  const update = async (method, key, value) => {
    try {
      const token = dexAuth?.userData?.id_token;

      // prepare the payload
      let body = { ...user };
      body[attrKey] = { ...user[attrKey] }
      body[attrKey][key] = value;
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      if (identity) {
        headers.identity = identity;
      }
      const response = await fetch(`${apiOrigin}/api/users/${user.id}`, {
        body: JSON.stringify(body),
        headers,
        method
      });

      if (!response.ok) {
        const responseData = await response.text();
        setError(responseData);
        return;
      }

      const userData = await response.json();
      setUser(userData);

      // reload the user, just to make sure we have the correct data
      loadUser();
    } catch (error) {
      setUser(null);
      setError(error);
    }
  };

  // used for both edit and update (PUT and POST)
  const updateUser = async (setter, method, field, value) => {
    // if in update mode, call the update function
    await update(method, field, value);
    setter(false);
  };

  const deleteUser = () => {
    const del = async () => {
      try {
        const token = dexAuth?.userData?.id_token;
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        if (identity) {
          headers.identity = identity;
        }
        const response = await fetch(`${apiOrigin}/api/users/${user.id}`, {
          headers,
          method: 'DELETE'
        });

        if (!response.ok) {
          const responseData = await response.text();
          setError(responseData);
          return;
        }

        await response.json();
        loadUsers();
        history.push('/people');
      } catch (error) {
        setUser(null);
        setError(error);
      }
    };
    del();
  };

  const hide = () => {
    // reset state
    setError(null);
    setPhone(user[attrKey].phone);
    setDepartment(user[attrKey].department);
    setTitle(user[attrKey].title);
  };

  if (!getDisplayState('GET', resourcePath).visible) {
    return (
      <Container className="mb-5">
        <h2>Error</h2>
        <h3>You don't have sufficient permissions to view this user.</h3>
      </Container>
    )
  }

  // default displayState
  const display = { visible: true, enabled: true };

  return (
    !loading ? (<Container className="mt-5 mb-5">
      <Row className="align-items-center profile-header mb-5 text-center text-md-left">
        <Col md={2}>
          <img
            src={user[attrKey].picture}
            alt="Profile"
            className="rounded-circle img-fluid profile-picture mb-3 mb-md-0"
          />
        </Col>
        <Col md={5}>
          <h2>{user.displayName}</h2>
          <p className="lead text-muted">{user.email}</p>
          <h4>Manager: &nbsp;
            <Link to={`/people/${user[attrKey].manager}`}>
              {managerName || user[attrKey].manager}
            </Link>
          </h4>

          {editing ?
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text style={{ minWidth: 60 }}>Phone</InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl value={phone} onChange={(e) => setPhone(e.target.value)} />
              <InputGroup.Append>
                <Button
                  style={{ width: 110 }}
                  displayState={display}
                  onClick={() => updateUser(setEditing, 'PUT', 'phone', phone)}
                >
                  Save
                </Button>
              </InputGroup.Append>
            </InputGroup> :
            <div style={{ display: 'flex' }}>
              <h4>Phone: &nbsp;&nbsp;</h4>
              <p className="lead text-muted">{user[attrKey].phone}</p>
            </div>
          }
        </Col>
        <Col md={5}>
          <Button
            style={{ marginRight: 30, width: 110 }}
            displayState={getDisplayState('PUT', resourcePath)}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
          <Button
            style={{ marginRight: 30, width: 115 }}
            displayState={display}
            onClick={() => setShowDetail(!showDetail)}
          >
            {showDetail ? 'Hide' : 'Show'} Detail
          </Button>
        </Col>
      </Row>

      {updating ?
        <>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text style={{ minWidth: 120 }}>Department</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl value={department} onChange={(e) => setDepartment(e.target.value)} />
                <InputGroup.Append>
                  <Button
                    style={{ width: 110 }}
                    displayState={display}
                    onClick={() => updateUser(setUpdating, 'POST', 'department', department)}
                  >
                    Save
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Col>
          </Row>
          <br />
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text style={{ minWidth: 120 }}>Title</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl value={title} onChange={(e) => setTitle(e.target.value)} />
                <InputGroup.Append>
                  <Button
                    style={{ width: 110 }}
                    displayState={display}
                    onClick={() => updateUser(setUpdating, 'POST', 'title', title)}
                  >
                    Save
                  </Button>
                </InputGroup.Append>
              </InputGroup>
            </Col>
          </Row>
          <br />
        </> :
        <div>
          <Row>
            <Col md={2}>
              <h4>Department:</h4>
            </Col>
            <Col md>
              <p className="lead text-muted">{user[attrKey].department}</p>
            </Col>
          </Row>
          <Row>
            <Col md={2}>
              <h4>Title:</h4>
            </Col>
            <Col md>
              <p className="lead text-muted">{user[attrKey].title}</p>
            </Col>
          </Row>
        </div>
      }

      <br />

      <Row>
        <Col md={2}>
          <Button
            style={{ width: 110 }}
            displayState={getDisplayState('POST', resourcePath)}
            onClick={() => setUpdating(!updating)}
          >
            {updating ? 'Cancel' : 'Update'}
          </Button>
        </Col>
        <Col md={2}>
          <Button
            style={{ width: 110 }}
            displayState={getDisplayState('DELETE', resourcePath)}
            onClick={deleteUser}
          >
            Delete
          </Button>
        </Col>
      </Row>

      <hr />

      {showDetail &&
        <Row>
          <Highlight>{JSON.stringify(user, null, 2)}</Highlight>
        </Row>
      }

      <Modal className="danger" show={error ? true : false} size="sm" onHide={hide}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error}
        </Modal.Body>
        <Modal.Footer>
          <Button displayState={display} variant="primary" onClick={hide}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>) : <LoadingSpinner />
  )
})

export default UserDetails
