import socket from 'socket.io'
const setupSocket = (server)=>{
    const io = socket(server)
    io.on('connection', (socket)=>{
        console.log(socket.id)
      })
    return io
}
export default setupSocket