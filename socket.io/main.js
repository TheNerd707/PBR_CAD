const membershipDB = require(`../schema/memberShip`)
const callsDB = require(`../schema/calls`);

module.exports = (Socket) => {
  Socket.on("connection", (socket) => {
      socket.join(socket.request.session.guildId);
      Socket.to(socket.request.session.guildId).emit("userConnected", {
          userId: socket.request.session.userId,
          guildId: socket.request.session.guildId,
      });
      socket.on("fetchAllCalls", async (data) => {
        const calls = await callsDB.find({ guild: socket.request.session.guildId })
          .populate("participants.user")
          .sort({ createdAt: -1 });
        const allCalls =[]
        calls.forEach(call => {
            let participants = [];
            call.participants.forEach(participant => {
                if (participant.type === "civilian") return;
                participants.push(participant.callSign || participant.user.username);
            });
            let additionalsNeeded = ``;
            call.additionalsNeeded.forEach(additional => {
              additionalsNeeded += `${additional.number} ${additional.type}, `;
            })
            allCalls.push({
                id: call._id,
                title: call.title,
                description: call.description,
                location: call.location,
                units: participants,
                additionalsNeeded: additionalsNeeded.slice(0, -2),
            });
        })
        socket.emit("calls", allCalls);
    })
  });

  return Socket;
};
