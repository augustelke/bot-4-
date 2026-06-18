const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

module.exports = [

    // =========================
    // /signal (FIXED)
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("signal")
            .setDescription("Envoyer un signalement")
            .addStringOption(o =>
                o.setName("raison")
                    .setDescription("Raison du signalement")
                    .setRequired(true)
            ),

        async execute(interaction, loadDB, saveDB) {

            const reason = interaction.options.getString("raison");

            const db = loadDB();

            if (!db.reports) db.reports = [];

            db.reports.push({
                id: Date.now().toString(),
                userId: interaction.user.id,
                reason: reason,
                createdAt: Date.now()
            });

            saveDB(db);

            return interaction.reply({
                content: "✅ Signalement envoyé.",
                ephemeral: true
            });
        }
    },

    // =========================
    // /supsignal
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir ses signalements"),

        async execute(interaction, loadDB) {

            const db = loadDB();

            const reports = (db.reports || []).filter(
                r => r.userId === interaction.user.id
            );

            if (!reports.length) {
                return interaction.reply({
                    content: "Aucun signalement.",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("Tes signalements")
                .setColor("Red")
                .setDescription(
                    reports.map((r, i) =>
                        `${i + 1}. ${r.reason} (ID: ${r.id})`
                    ).join("\n")
                );

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    },

    // =========================
    // /voirsignal (ADMIN)
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Voir tous les signalements")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction, loadDB) {

            const db = loadDB();

            if (!db.reports || db.reports.length === 0) {
                return interaction.reply({
                    content: "Aucun signalement.",
                    ephemeral: true
                });
            }

            const stats = {};

            for (const r of db.reports) {
                stats[r.userId] = (stats[r.userId] || 0) + 1;
            }

            const text = Object.entries(stats)
                .map(([id, count]) => `<@${id}> - ${count}`)
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle("📊 Signalements")
                .setColor("Orange")
                .setDescription(text);

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    },

    // =========================
    // /help
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Aide du bot"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("📖 Commandes")
                .setColor("Blue")
                .setDescription(`
/signal → envoyer un signalement
/supsignal → voir ses signalements
/voirsignal → admin
/help → aide
                `);

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }

];
