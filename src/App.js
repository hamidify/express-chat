import io from "socket.io-client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import "./App.css";

let socket;
function App() {

  const [username, setUsername] = useState('');
  const [choosenRoom, setChosenRoom] = useState('');
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [rooms, setRooms] = useState(['1', '2']);
  const [roomUsers, setRoomUsers] = useState([]);


  useEffect(() => {
    init();
  }, []);

  const init = useCallback(() => {
    socket = io('http://localhost:5000');
    socket.on('newMessage', (msg) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: msg.username, message: msg.message },
      ]);
    });
    socket.on("usersInRoom", ({ users }) => {
      setRoomUsers(users);
    });

    socket.on('rooms', (({ rooms }) => {
      setRooms([...rooms])
    }))
  }, []);

  const joinRoom = useCallback((room) => {
    const randomUserName = uniqueNamesGenerator({
      dictionaries: [colors, animals]
    });
    setUsername(randomUserName)
    setChosenRoom(room)
    if (socket.connected)
      socket.emit('joining', { username: randomUserName, room })
    else {
      init()
      socket.emit('joining', { username: randomUserName, room })
    }
  }, [])

  const leaveRoom = useCallback(() => {
    setUsername('')
    setChosenRoom('')
    setMessages([]);
    setRoomUsers([]);
    socket.disconnect()
  }, [])

  const send = async () => {
    socket.emit("sendMessage", message);
    setMessages((currentMsg) => [
      ...currentMsg,
      { sender: username, message },
    ]);
    setMessage("");
  };

  const handleOnEnter = (e) => {
    if (e.keyCode === 13) {
      if (message) {
        send();
      }
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <main >
        {!choosenRoom ? (
          <>
            <h3>
              List of Rooms
            </h3>

            {rooms.map((room, i) => {
              return (
                <p
                  style={{ color: 'blue', cursor: 'pointer' }}
                  onClick={() => joinRoom(room)}
                  key={i}
                >
                  {i + 1} : {room}
                </p>
              );
            })}
            <button
              onClick={() => {
                const randomRoomName = uniqueNamesGenerator({
                  dictionaries: [colors, animals]
                });
                joinRoom(randomRoomName)
              }}
            >
              Create and Join Room
            </button>
          </>
        ) : (
          <>
            <p>
              Your username: <i>{username}</i>
              <button style={{ float: 'right', marginRight: '30%' }} onClick={() => {
                leaveRoom()
              }}>
                Leave Room
              </button>
            </p>
            <div style={{ columnCount: 'auto', columnWidth: '350px', columnRule: 'dashed' }}>
              <div style={{ display: 'inline-block' }}>
                <p>
                  {roomUsers.length} Users in room <i> {choosenRoom} </i>
                </p>
                {roomUsers.map((user, i) => {
                  return (
                    <div
                      key={i}
                    >
                      - {user.username}
                    </div>
                  );
                })}
              </div>
              <div>
                <div style={{ display: 'inline-block' }}>
                  {messages.map((msg, i) => {
                    return (
                      <div key={i}>
                        {msg.sender} : <i> {msg.message}</i>
                      </div>
                    );
                  })}
                  <input
                    style={{ marginTop: '10px', marginRight: '10px' }}
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyUp={handleOnEnter}
                  />
                  <button
                    onClick={() => {
                      send();
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div >
  );
}

export default App;
