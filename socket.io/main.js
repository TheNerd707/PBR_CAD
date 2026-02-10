const membershipDB = require(`../schema/memberShip`)
const callsDB = require(`../schema/calls`);

module.exports = (Socket) => {
  Socket.on("connection", async (socket) => {
      socket.join(socket.request.session.guildId);
      Socket.to(socket.request.session.guildId).emit("userConnected", {
          userId: socket.request.session.userId,
          guildId: socket.request.session.guildId,
      });
      const membership = await membershipDB.findOne({
        user: socket.request.session.userId,
        guild: socket.request.session.guildId, //change to use call guild instead, just so someone cant delete a call for another guild
      });
      if (!membership) {
        console.error("Membership not found for user:", socket.request.session.userId);
        socket.emit("error", "You are not a member of this guild.");
        return;
      }
      if (membership.leo === false) {
        console.error("User is not a member of the LEO department:", socket.request.session.userId);
        socket.emit("error", "You are not a member of the LEO department.");
        return;
      }
      const supervisor = membership.leo.supervisor || false;
      socket.emit("userData", {
        supervisor
      })
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
