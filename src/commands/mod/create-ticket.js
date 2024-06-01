const { SlashCommandBuilder, PermissionsBitField, TextInputStyle, ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("create-ticket")
        .setDescription("Установить окно с созданием тикетов. Будет автоматически создан канал для модерации с логом тикетов."), 
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.All)) return;

        const createTicketModal = new ModalBuilder()
            .setCustomId(`CreateTicket`)
            .setTitle("Создание окна тикетов");

        const titleInput = new TextInputBuilder()
            .setCustomId("titleInput")
            .setLabel("Название окна:")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const descriptionInput = new TextInputBuilder()
            .setCustomId("descriptionInput")
            .setLabel("Описание окна:")
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph);

        const name1Button = new TextInputBuilder()
            .setCustomId("nameButton1")
            .setLabel("Название первой кнопки:")
            .setPlaceholder("Данное поле поддерживает эмодзи")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const name2Button = new TextInputBuilder()
            .setCustomId("nameButton2")
            .setLabel("Название первой кнопки:")
            .setPlaceholder("По желанию, две кнопки позволят разделять тикеты на два вида")
            .setRequired(false)
            .setStyle(TextInputStyle.Short);

        const imageInput = new TextInputBuilder()
            .setCustomId("imageInput")
            .setLabel("Картинка:")
            .setPlaceholder("По желанию")
            .setRequired(false)
            .setStyle(TextInputStyle.Short);

        const titleActionRow = new ActionRowBuilder().addComponents(titleInput);
        const descriptionActionRow = new ActionRowBuilder().addComponents(descriptionInput);
        const nameButton1ActionRow = new ActionRowBuilder().addComponents(name1Button);
        const nameButton2ActionRow = new ActionRowBuilder().addComponents(name2Button);
        const imageActionRow = new ActionRowBuilder().addComponents(imageInput);

        createTicketModal.addComponents(titleActionRow, descriptionActionRow, nameButton1ActionRow, nameButton2ActionRow, imageActionRow);

        await interaction.showModal(createTicketModal);
    }
}