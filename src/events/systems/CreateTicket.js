const fs = require('fs');
const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { DiscordServers, DiscordServersTicketBan } = require("../../models/model");

async function CreateTicket(interaction){
    const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
    if (!server) return;
    
    const currentTimeInMillis = new Date().getTime();

    const hasBlock = await DiscordServersTicketBan.findOne({ guildId: interaction.guild.id, userId: interaction.member.id, expiresOn: { $gt: currentTimeInMillis } })
    if (hasBlock) return await interaction.reply({
        content: `\`[❌] У вас имеется активная блокировка тикетов!\`\n\n**Выдал:** <@${hasBlock.mod}>\n**Причина:** ${hasBlock.reason}\n**Истекает:** <t:${Math.floor(hasBlock.expiresOn/1000)}:R>`,
        ephemeral: true
    })

    const typeButton = interaction.customId.split("_").pop();

    const thread = await interaction.channel.threads.create({
        name: `${typeButton} | ${interaction.member.user.username}`,
        autoArchiveDuration: 60,
        type: ChannelType.PrivateThread,
        reason: `Ticket from ${interaction.member.user.username}`,
        invitable: false
    });
    
    const embedThread = new EmbedBuilder()
        .setTitle("Ожидание модерации")
        .setDescription("\`\`\`\nДо тех пор, пока модерация не принялась за ваш тикет - вы можете заранее расписать суть вашей проблемы.\n\`\`\`")
        .setColor(0xffd817)
    
    await thread.send({
        content: "",
        embeds: [embedThread]
    })

    await interaction.reply({
        content: '`[✅] Тикет был успешно создан!`\n`Тикет:` <#' + thread.id + '>',
        ephemeral: true
    });

    const embedLog = new EmbedBuilder()
        .setTitle("**📌 | Новый тикет**")
        .setDescription(`**Автор:** ${interaction.member.id}\n**Тип тикета:** ${typeButton}\n**Создан:** <t:${currentTimeInMillis}>`)
        .setColor(0xffd817)
    
    const channel = interaction.guild.channels.cache.get(server.logChannel);
    if(!channel) return await interaction.reply({
        content: "\`[❌] Произошла ошибка во время создания тикета! Сообщите об этом модерации.\`",
        ephemeral: true
    })

    const component = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`TakeTicket_${thread.id}`)
                .setLabel("Взять тикет")
                .setStyle(ButtonStyle.Secondary)
        )

    await channel.send({
        content: `<@&${server.supportId}>`,
        embeds: [embedLog],
        components: [component]
    })
        .then(async message => {
            await message.pin();
        })

    await thread.members.add(interaction.member.id);
    await thread.send(`<@${interaction.member.id}>`)
        .then(async message => {
            await message.delete()
        })
};

async function AcceptTicket(interaction) {
    const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
    if (!server) return;

    const hasRole = await interaction.member.roles.cache.has(server.supportId)

    if(!hasRole) return;

    const threadId = interaction.customId.split("_").pop();

    const thread = await interaction.guild.channels.fetch(threadId);

    // const thread = channel.threads.cache.find(x => x.id === threadId);
    await thread.members.add(interaction.member.id);

    const messages = await thread.messages.fetch({ limit: 10 });
    const firstMessage = messages.find(message => message.position === 0);

    const embed = new EmbedBuilder(firstMessage.embeds[0]);

    const component = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`CloseTicket_${thread.id}`)
                .setEmoji({name: "🔒"})
                .setLabel("Закрыть тикет")
                .setStyle(ButtonStyle.Secondary)
        )

    embed.setTitle(`✅ | Тикет рассматривает ${interaction.member.user.username}`);
    embed.setDescription(`Распишите суть проблемы, если еще не сделали это.\nКак только вы получите ответ на свой вопрос - нажмите кнопку ниже.`)
    embed.setColor(0x00ff00)

    await firstMessage.edit({ embeds: [embed], components: [component] });

    const embedLog = new EmbedBuilder(interaction.message.embeds[0]);

    embedLog.addFields({ name: "Тикет был взят:", value: `<@${interaction.member.id}>` })
    embedLog.setColor(0x00ff00)

    await interaction.message.edit({ embeds: [embedLog], components: [] })
        .then(async msg => {
            await msg.unpin()
        })
}

async function CloseTicket(interaction){
    const server = await DiscordServers.findOne({ guildId: interaction.guild.id })
    if (!server) return;

    const threadId = interaction.customId.split("_").pop();
    const thread = await interaction.guild.channels.fetch(threadId);

    const messages = await thread.messages.fetch();

    const fileName = `messages_${threadId}.txt`;
    let formattedMessages = '';

    messages.forEach(message => {
        if (!message.author.bot){
            formattedMessages += `${message.author.username}(${message.author.id}): ${message.content}\n`;
        }
    });

    fs.writeFileSync(fileName, formattedMessages);

    const channel = await interaction.guild.channels.fetch(server.logChannel);

    await channel.send({
        content: `\`[✅] Тикет \`<#${threadId}>\` был закрыт.\``,
        files: [{
            attachment: fileName,
            name: `messages_${threadId}.txt`
        }]
    });

    fs.unlinkSync(fileName);

    const members = await thread.members.fetch();
    for (const [memberId, member] of members) {
        await thread.members.remove(memberId);
    }
    await thread.setLocked(true);
}

module.exports = { CreateTicket, AcceptTicket, CloseTicket };