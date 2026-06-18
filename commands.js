const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// HELP
const help = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Affiche les commandes"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("Aide")
            .setDescription(`
/tournage
/signal
/supsignal
/voirsignal
/kick
/ban
/mute
/clear
/lock
/unlock
/slowmode
/roulette
/help
            `);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

// ROULETTE
const roulette = {
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Nombre aléatoire"),

    async execute(interaction) {
        return interaction.reply(`🎲 ${Math.floor(Math.random() * 100)}`);
    }
};

module.exports = [
    help,
    roulette
];
