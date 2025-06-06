module.exports = (Socket) => {
    Socket.on("connection", (socket) => {
       socket.on("leoConnect", async (data) => {
            if (!socket.request.session.userId) {
                socket.emit("error", "You must be logged in to connect.");
                return;
            };
            const userID = socket.request.session.userId;
       });
    });
    return Socket;
}
