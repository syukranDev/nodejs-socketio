const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/message')
const { userJoin, getCurrentUser, userLeaveChat, getRoomUsers} = require('./utils/user')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))

const botName = 'ChatBot'

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room)
        // console.log(user)

        socket.join(user.room)

        //Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to chatApps!'))

        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has joined the chat`))

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    
    })

    //runs when any client disconnect (close the browser?)
    socket.on('disconnect', () => {
        const user = userLeaveChat(socket.id)

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `A ${user.username} has left the chat`))
        }

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        
    })

    //listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id)
        io.emit('message', formatMessage(user.username, msg))
    })


})

const PORT = 6969 || process.env.PORT 

server.listen(PORT, () => {
    console.log(`Server listening to ${PORT}` )
})
