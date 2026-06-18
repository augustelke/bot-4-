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
        .setDescription("Liste des commandes"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("📖 Aide")
            .setDescription(`
/tournage (admin)
/signal
/supsignal
/voirsignal (admin)
/kick (admin)
/ban (admin)
/mute (admin)
/clear (admin)
/lock (admin)
/unlock (admin)
/slowmode (admin)
/roulette
/help
            `);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
};

// SIGNAL
const signal = {
    data: new SlashCommandBuilder()
        .setName("signal")
        .setDescription("Envoyer un signalement")
        .addStringOption(o =>
            o.setName("raison")
                .setDescription("Raison")
                .setRequired(true)
        ),

    async execute(interaction, loadDB, saveDB) {

        const db = loadDB();

        db.reports.push({
            id: Date.now().toString(),
            userId: interaction.user.id,
            reason: interaction.options.getString("raison"),
            createdAt: Date.now()
        });

        saveDB(db);

        return interaction.reply({ content: "Signal envoyé", ephemeral: true });
    }
};

// SUP SIGNAL
const supsignal = {
    data: new SlashCommandBuilder()
        .setName("supsignal")
        .setDescription("Voir signalements"),

    async execute(interaction, loadDB, saveDB) {

        const db = loadDB();
        const reports = db.reports.filter(r => r.userId === interaction.user.id);

        if (!reports.length)
            return interaction.reply({ content: "Aucun signal", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle("Tes signalements")
            .setDescription(
                reports.map(r => `• ${r.reason} (${r.id})`).join("\n")
            );

        const row = new ActionRowBuilder().addComponents(
            ...reports.slice(0, 5).map(r =>
                new ButtonBuilder()
                    .setCustomId(`delete_report_${r.id}`)
                    .setLabel("Supprimer")
                    .setStyle(ButtonStyle.Danger)
            )
        );

        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};

// VOIR SIGNAL
const voirsignal = {
    data: new SlashCommandBuilder()
        .setName("voirsignal")
        .setDescription("Admin signalements")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, loadDB) {

        const db = loadDB();

        const stats = {};

        for (const r of db.reports) {
            stats[r.userId] = (stats[r.userId] || 0) + 1;
        }

        const text = Object.entries(stats)
            .map(([id, c]) => `<@${id}> - ${c}`)
            .join("\n");

        return interaction.reply({
            embeds: [new EmbedBuilder().setTitle("Signals").setDescription(text)],
            ephemeral: true
        });
    }
};

// KICK
const kick = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);
        await member.kick();
        return interaction.reply({ content: "Kick OK", ephemeral: true });
    }
};

// BAN
const ban = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        await interaction.guild.members.ban(user.id);
        return interaction.reply({ content: "Ban OK", ephemeral: true });
    }
};

// ROULETTE
const roulette = {
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Random"),

    async execute(interaction) {
        return interaction.reply(`🎲 ${Math.floor(Math.random() * 100)}`);
    }
};

module.exports = [
    help,
    signal,
    supsignal,
    voirsignal,
    kick,
    ban,
    roulette
];
