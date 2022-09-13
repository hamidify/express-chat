const users = [];
const listRooms = () => {
  const rooms = [...new Set([...users.map((user) => user.room)])]
  return rooms || [];
}

const getUser = (id) => users.filter((user) => user.id === id)[0];

const addNewUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  const existingUser = users.find((user) => user.room === room && user.username === username);
  if (existingUser) throw new Error('Username unavailbale.');
  const user = { id, username, room };
  users.push(user);
  return { user };
}

const kickoutUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) return users.splice(index, 1)[0];
}


const listUsers = (room) => users.filter((user) => user.room === room);

module.exports = { addNewUser, kickoutUser, getUser, listUsers, listRooms };