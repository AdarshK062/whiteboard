module.exports = function(io, Users){

const users = new Users();

    io.on('connection', (socket) => {
        //console.log('user connected');
        socket.on('join', (params, callback) => {
            socket.join(params.room);
            users.AddUserData(socket.id, params.name, params.room);
            socket.on('textclick', function (data) {
                io.to(params.room).emit('textdraw', data);
            });
            socket.on('linedraw', function (data) {
                io.to(params.room).emit('linedrawing', data);
            });
            socket.on('ellipsedraw', function (data) {
                io.to(params.room).emit('ellipsedrawing', data);
            });
            socket.on('circledraw', function (data) {
                io.to(params.room).emit('circledrawing', data);
            });
            socket.on('rectdraw', function (data) {
                io.to(params.room).emit('rectdrawing', data);
            });
            socket.on('mousemove', function (data) {
                io.to(params.room).emit('moving', data);
            });
            io.to(params.room).emit('usersList', users.GetUsersList(params.room));
            //console.log(users);
            callback();
       });
       
        socket.on('createMessage', (message,callback) => {
            //console.log(message);
            io.to(message.room).emit('newMessage', {
                text: message.text,
                room: message.room,
                from: message.from,
                image: message.userPic
            });

            callback();
        });
        socket.on('disconnect', () => {
            var user = users.RemoveUser(socket.id);
            if(user){
                io.to(user.room).emit('usersList', users.GetUsersList(user.room));
            }
        })
    });
}