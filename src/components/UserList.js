import React from 'react'
import { Row } from 'react-bootstrap'
import UserCard from './UserCard'

const UserList = ({ users }) => {
  const idKey = 'id';
  const results = 40;

  return (
    users ?
      <Row>
        {users.slice(0, results).map(u => <UserCard key={u[idKey]} user={u} />)}
      </Row> :
      <div />
  )
}

export default UserList
