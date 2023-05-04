const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')
const socket = io()


//get params url data
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

//Join chatroom
socket.emit('joinRoom', { username, room })

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room)
  outputUsers(users)
})



//message from server
socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    //scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight
})

chatForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const msg = e.target.elements.msg.value

  //Emit message to server
  socket.emit('chatMessage', msg)


  //clear input
  e.target.elements.msg.value = ''
  e.target.elements.msg.focus() //to let cursor to click at chat input
})

//output message to DOM
function outputMessage(message) {
  const div = document.createElement('div')
  div.classList.add('message')
  div.innerHTML = 
    `
      <p class="meta">${message.username} <span>${message.time}</span></p>
      <p class="text">${message.text}</p>
    `
  document.querySelector('.chat-messages').appendChild(div)
}

//add room name to DOM
function outputRoomName(room){
  roomName.innerText = room
}

//add users array to DOM
function outputUsers(users){
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')} 
  `
  // join('') because array and want to remove ',' into the User list in UI
}