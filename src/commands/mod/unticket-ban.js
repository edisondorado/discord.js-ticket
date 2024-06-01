const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers, DiscordServersTicketBan } = require("../../models/model");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unticket-ban")
        .setDescription("Восстановить доступ к тикетам")
        .addUserOption(option => 
            option
                .setName("пользователь")
                .setDescription("Пользователь, которому необходимо восстановить доступ")
                .setRequired(true)),
    async execute(interaction){
        const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
        if (!server) return await interaction.reply({
            content: "\`[❌] Сервер отсутствует в базе данных! Вам необходимо создать сообщение для тикетов: /create-ticket\`",
            ephemeral: true
        })

        const hasRole = await interaction.member.roles.cache.has(server.supportId)
        if(!hasRole) return;

        const target = interaction.options.getMember("пользователь");

        const currentTimeInMillis = new Date().getTime();
        const hasBlock = await DiscordServersTicketBan.findOne({ guildId: interaction.guild.id, userId: target.id, expiresOn: { $gt: currentTimeInMillis } })
        if (!hasBlock) return await interaction.reply({
            content: "\`[❌] У пользователя отсутствует активная блокировка тикетов.\`",
            ephemeral: true
        })

        if (target.permissions.has(PermissionsBitField.All)) return await interaction.reply({
            content: "\`[❌] Вы не можете использовать это на данном пользователе!\`",
            ephemeral: true
        })
        
        if (interaction.member.id === target.id){
            return interaction.reply({
                content: "\`[❌] Вы не можете использовать это на себе!\`",
                ephemeral: true
            })
        }

        if (interaction.member.id === interaction.client.id){
            return interaction.reply({
                content: "\`[❌] Вы не можете использовать это на мне!\`",
                ephemeral: true
            })
        }

        await DiscordServersTicketBan.findOneAndDelete({
            guildId: interaction.guild.id, 
            userId: target.id
        })

        await interaction.reply({
            content: "\`[✅] Пользователю успешно снята блокировка!\`", 
            ephemeral: true
        });
    }
}