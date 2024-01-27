const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

const buttonStates = {}; // Tracks the state of each button

const handleBusEvent = async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId.startsWith('checkin-')) return;

    const customId = interaction.customId;
    const currentState = buttonStates[customId] || 'initial';
    let newState, newLabel, newStyle;

    switch (currentState) {
        case 'initial':
            newState = 'checked-in';
            newLabel = 'Checked-in';
            newStyle = ButtonStyle.Success;
            break;
        case 'checked-in':
            newState = 'on-the-bus';
            newLabel = 'On The Bus';
            newStyle = ButtonStyle.Danger; // Or any other style you prefer
            break;
        case 'on-the-bus':
            newState = 'initial';
            newLabel = 'Check-in';
            newStyle = ButtonStyle.Primary;
            break;
    }

    buttonStates[customId] = newState;

    const updatedButton = new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(newLabel)
        .setStyle(newStyle);

    const updatedRow = new ActionRowBuilder().addComponents(updatedButton);
    await interaction.update({ components: [updatedRow] });
};

module.exports = handleBusEvent;
