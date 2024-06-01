const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType, PermissionsBitField } = require("discord.js");
const { DiscordServers } = require("../../models/model");

async function CreateTicketWindow(interaction){
    const title = interaction.fields.getTextInputValue("titleInput");
    const description = interaction.fields.getTextInputValue("descriptionInput");
    const button1 = interaction.fields.getTextInputValue("nameButton1");
    const button2 = interaction.fields.getTextInputValue("nameButton2");
    const img = interaction.fields.getTextInputValue("imageInput");

    let server;
    server = await DiscordServers.findOne({ guildId: interaction.guild.id })

    if(!server){
        server = await DiscordServers.create({
            guildId: interaction.guild.id
        })
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x595fff)

    const button_1 = new ButtonBuilder()
        .setCustomId(`TicketButton1_${button1}`)
        .setLabel(button1)
        .setStyle(ButtonStyle.Secondary)

    const button_2 = new ButtonBuilder()
        .setCustomId(`TicketButton2_${button2}`)
        .setLabel(button2 ? button2 : " ")
        .setStyle(ButtonStyle.Secondary)

    const optionButtons = new ActionRowBuilder();
    if (button2 !== null) {
        optionButtons.addComponents(button_1, button_2);
    } else {
        optionButtons.addComponents(button_1);
    }

    if (img !== null && img !== "" && img !== " "){
        embed.setImage(img);
    }

    const channel = await interaction.guild.channels.create({
        name: "лог-тикеты",
        type: ChannelType.GuildText,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel],
            }
        ],
    })

    const updateServer = await DiscordServers.findOne({ guildId: interaction.guild.id });

    updateServer.logChannel = channel.id;

    await updateServer.save();

    await interaction.channel.send({
        content: "",
        embeds: [embed],
        components: [optionButtons]
    })
    
    await interaction.reply({
        content: `\`[✅] Система успешно установлена!\`\n\n\`Канал логирования тикетов:\` <#${channel.id}>\n\`Не забудьте настроить роль модерации:\` /access-ticket`,
        ephemeral: true
    })
}

module.exports = CreateTicketWindow;