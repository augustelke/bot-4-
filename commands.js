const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits
} = require("discord.js");

// mini mémoire signal
const reports = [];

module.exports = [

    // ================= HELP =================
    {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Aide"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("Help")
                .setDescription(`
/tournage
/signal
/supsignal
/voirsignal
/kick /ban /mute /clear /lock /unlock /slowmode
/roulette
                `);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    // ================= TOURNAGE =================
    {
        data: new SlashCommandBuilder()
            .setName("tournage")
            .setDescription("Créer tournoi")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(o => o.setName("nom").setRequired(true))
            .addStringOption(o => o.setName("horaire").setRequired(true))
            .addStringOption(o => o.setName("description").setRequired(true)),

        async execute(interaction) {

            const nom = interaction.options.getString("nom");
            const horaire = interaction.options.getString("horaire");
            const desc = interaction.options.getString("description");

            const embed = new EmbedBuilder()
                .setTitle(nom)
                .addFields(
                    { name: "Horaire", value: horaire },
                    { name: "Description", value: desc }
                );

            const row = new (require("discord.js").ActionRowBuilder)().addComponents(
                new (require("discord.js").ButtonBuilder)()
                    .setCustomId("participate_tournament")
                    .setLabel("Participer")
                    .setStyle(require("discord.js").ButtonStyle.Success)
            );

            await interaction.reply({ content: "OK", ephemeral: true });

            const channel = await interaction.client.channels.fetch("1502721949376188478");
            channel.send({ embeds: [embed], components: [row] });
        }
    },

    // ================= SIGNAL =================
    {
        data: new SlashCommandBuilder()
            .setName("signal")
            .setDescription("Signalement")
            .addStringOption(o => o.setName("raison").setRequired(true)),

        async execute(interaction) {

            reports.push({
                id: Date.now().toString(),
                user: interaction.user.id,
                reason: interaction.options.getString("raison")
            });

            return interaction.reply({ content: "Signal envoyé", ephemeral: true });
        }
    },

    // ================= SUP SIGNAL =================
    {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir signalements"),

        async execute(interaction) {

            const userReports = reports.filter(r => r.user === interaction.user.id);

            return interaction.reply({
                content: JSON.stringify(userReports, null, 2),
                ephemeral: true
            });
        }
    },

    // ================= VOIR SIGNAL =================
    {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Admin signal")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {
            return interaction.reply({
                content: JSON.stringify(reports, null, 2),
                ephemeral: true
            });
        }
    },

    // ================= ROULETTE =================
    {
        data: new SlashCommandBuilder()
            .setName("roulette")
            .setDescription("random"),

        async execute(interaction) {
            return interaction.reply(`🎲 ${Math.floor(Math.random() * 100)}`);
        }
    }
];
