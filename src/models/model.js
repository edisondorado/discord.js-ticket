const mongoose = require("mongoose");

const DiscordServers = mongoose.model("DiscordServers_Ticket", new mongoose.Schema({
    guildId: String,
    supportId: {
        type: String,
        default: "0"
    },
    logChannel: String,
}));

const DiscordServersTicketBan = mongoose.model("DiscordServersTicketBan_Ticket", new mongoose.Schema({
    guildId: String,
    userId: String,
    mod: String,
    reason: String,
    expiresOn: String,
}));

module.exports = { DiscordServers, DiscordServersTicketBan };
