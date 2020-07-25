module.exports = function(io){
    io.on('connection', (socket) => {
        console.log('user connected');
        socket.on('join', (params, callback) => {
            socket.join(params.room);
            callback();
       });
       
        socket.on('createSolution', (message,callback) => {
            io.to(message.room).emit('newSolution', {
                text: message.text,
                room: message.room,
                from: message.from,
                image: message.image
            });
            callback();
        });
    });
}