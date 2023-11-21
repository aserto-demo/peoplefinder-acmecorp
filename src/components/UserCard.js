import React from 'react'
import { Card } from 'react-bootstrap'
import { withRouter } from 'react-router-dom'

const UserCard = withRouter(({ user, history }) => {
  const id = user.id;
  const name = user.displayName;

  return (
    <Card onClick={() => history.push(`/people/${id}`)}
      style={{
        maxWidth: 200,
        minWidth: 200,
        margin: 10
      }}>
      <Card.Img src={user.properties.picture} alt="picture" />
      <Card.Body>
        <Card.Title as="h5">{name}</Card.Title>
        <Card.Text>{user.properties.email}</Card.Text>
      </Card.Body>
    </Card>
  )
})

export default UserCard
