const ms = require("ms");
const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { DiscordServers, DiscordServersTicketBan } = require("../../models/model");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ticket-ban")
        .setDescription("Заблокировать доступ к тикетам")
        .addUserOption(option => 
            option
                .setName("пользователь")
                .setDescription("Пользователь, которому необходимо выдать заблокировать доступ")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("время")
                .setDescription("5 s/m/h/d")
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName("причина")
                .setDescription("-")
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
        const time = interaction.options.getString("время");
        const reason = interaction.options.getString("причина");
        const formattedDuration = ms(time);
        const maxDuration = ms("28 days");

        const modHighest = highestRole(interaction.member);
        const targetHighest = highestRole(target);

        if (modHighest.position < targetHighest.position) return await interaction.reply({
            content: "\`[❌] Вы не можете использовать это на пользователе, у которого роль выше вашей!\`",
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

        if (formattedDuration > maxDuration){
            return interaction.reply({
                content: "\`[❌] Время должно быть 28 дней или меньше!\`",
                ephemeral: true
            })
        }

        await DiscordServersTicketBan.create({
            guildId: interaction.guild.id,
            userId: target.id,
            mod: interaction.member.id,
            reason: reason,
            expiresOn: new Date().getTime() + formattedDuration,
        })

        await interaction.reply({
            content: "\`[✅] Пользователю успешно выдана блокировка!\`", 
            ephemeral: true
        });
    }
}

function highestRole(user) {
    let highest = null;
    user.roles.cache.forEach(role => {
        if (!highest || role.position > highest.position) {
            highest = role;
        }
    });
    return highest;
}