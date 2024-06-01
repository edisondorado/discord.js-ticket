const { Events } = require("discord.js");

const { CreateTicket, AcceptTicket, CloseTicket } = require("./systems/CreateTicket");
const CreateTicketWindow = require("./systems/CreateTicketWindow");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isButton()){
            if (interaction.customId.startsWith("TicketButton")) return await CreateTicket(interaction);
            if (interaction.customId.startsWith("TakeTicket_")) return await AcceptTicket(interaction);
            if (interaction.customId.startsWith("CloseTicket_")) return await CloseTicket(interaction);
        }

        if (interaction.isModalSubmit()){
            if (interaction.customId === "CreateTicket") return await CreateTicketWindow(interaction);
        }

        if (interaction.isChatInputCommand()){
            const command = interaction.client.commands.get(interaction.commandName);
            try{
                await command.execute(interaction)
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: '\`[❌] Error occured while using command!\`', ephemeral: true });
                } else {
                    await interaction.reply({ content: '\`[❌] Error occured while using command!\`', ephemeral: true });
                }
            }
        }
    }
};