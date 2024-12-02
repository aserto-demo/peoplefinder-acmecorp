import React from 'react'
import { CardDeck } from 'react-bootstrap'
import UserCard from './UserCard'

const UserList = ({ users }) => {

  return (
    users ?
      <CardDeck>
        {users.slice(0, 40).map(u => <UserCard key={u.id} user={u} />)}
      </CardDeck> :
      <div />
  )
}

export default UserList
