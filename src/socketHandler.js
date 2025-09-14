import { onlineUsers } from "../src/onlineUsers.js";
export function handleSocket(io) {
    io.on("connection", (socket) => {
        socket.on('userOnline',(email) =>{
            onlineUsers.set(email, socket.id);
            

            io.emit('updateUsers', Array.from(onlineUsers.keys()));
        })
        socket.on('disconnect', () => {
        for (let [email, id] of onlineUsers.entries()) {
            if(id === socket.id){
                onlineUsers.delete(email);
                break;
            }
        }
        io.emit('updateUsers', Array.from(onlineUsers.keys()));
    })
    })
}
