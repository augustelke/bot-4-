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
    // /tournage
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("tournage")
            .setDescription("Créer un tournoi")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(o =>
                o.setName("nom").setDescription("Nom").setRequired(true))
            .addStringOption(o =>
                o.setName("horaire").setDescription("Horaire").setRequired(true))
            .addStringOption(o =>
                o.setName("description").setDescription("Description").setRequired(true)
            ),

        async execute(interaction) {

            const nom = interaction.options.getString("nom");
            const horaire = interaction.options.getString("horaire");
            const description = interaction.options.getString("description");

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${nom}`)
                .setColor("Gold")
                .addFields(
                    { name: "📅 Horaire", value: horaire },
                    { name: "📝 Description", value: description }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("participate_tournament")
                    .setLabel("Participer")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({
                content: "Tournoi créé.",
                ephemeral: true
            });

            await interaction.channel.send({
                embeds: [embed],
                components: [row]
            });
        }
    },

    // =========================
    // /signal (FIX IMPORTANT)
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

            const report = {
                id: Date.now().toString(),
                userId: interaction.user.id, // ✅ FIX IMPORTANT
                reason: reason,
                createdAt: Date.now()
            };

            db.reports.push(report);
            saveDB(db);

            return interaction.reply({
                content: "✅ Signalement envoyé.",
                ephemeral: true
            });
        }
    },

    // =========================
    // /supsignal (FIX BUTTON)
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir ses signalements"),

        async execute(interaction, loadDB, saveDB) {

            const db = loadDB();

            const userReports = db.reports.filter(
                r => r.userId === interaction.user.id
            );

            if (!userReports.length) {
                return interaction.reply({
                    content: "Aucun signalement.",
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("Tes signalements")
                .setColor("Red")
                .setDescription(
                    userReports.map((r, i) =>
                        `${i + 1}. ${r.reason} (ID: ${r.id})`
                    ).join("\n")
                );

            const row = new ActionRowBuilder().addComponents(
                userReports.slice(0, 5).map(r =>
                    new ButtonBuilder()
                        .setCustomId(`delete_report_${r.id}`)
                        .setLabel("Supprimer")
                        .setStyle(ButtonStyle.Danger)
                )
            );

            return interaction.reply({
                embeds: [embed],
                components: [row],
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

            if (!db.reports.length) {
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
    // /kick
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("kick")
            .setDescription("Kick un membre")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addUserOption(o =>
                o.setName("user")
                    .setDescription("Utilisateur")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const user = interaction.options.getUser("user");
            const member = await interaction.guild.members.fetch(user.id);

            await member.kick();

            return interaction.reply({
                content: `👢 ${user.tag} kick`,
                ephemeral: true
            });
        }
    },

    // =========================
    // /ban
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Ban un membre")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addUserOption(o =>
                o.setName("user")
                    .setDescription("Utilisateur")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const user = interaction.options.getUser("user");

            await interaction.guild.members.ban(user.id);

            return interaction.reply({
                content: `🔨 ${user.tag} banni`,
                ephemeral: true
            });
        }
    },

    // =========================
    // /mute
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("mute")
            .setDescription("Timeout un membre")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addUserOption(o =>
                o.setName("user")
                    .setDescription("Utilisateur")
                    .setRequired(true)
            )
            .addIntegerOption(o =>
                o.setName("minutes")
                    .setDescription("Durée")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const user = interaction.options.getUser("user");
            const minutes = interaction.options.getInteger("minutes");

            const member = await interaction.guild.members.fetch(user.id);

            await member.timeout(minutes * 60000);

            return interaction.reply({
                content: `🔇 ${user.tag} mute ${minutes} min`,
                ephemeral: true
            });
        }
    },

    // =========================
    // /clear
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Supprimer des messages")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addIntegerOption(o =>
                o.setName("amount")
                    .setDescription("Nombre")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const amount = interaction.options.getInteger("amount");

            await interaction.channel.bulkDelete(amount, true);

            return interaction.reply({
                content: `🧹 ${amount} messages supprimés`,
                ephemeral: true
            });
        }
    },

    // =========================
    // /lock
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("lock")
            .setDescription("Verrouiller salon")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {

            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                { SendMessages: false }
            );

            return interaction.reply({
                content: "🔒 Salon verrouillé",
                ephemeral: true
            });
        }
    },

    // =========================
    // /unlock
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("unlock")
            .setDescription("Déverrouiller salon")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {

            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.roles.everyone,
                { SendMessages: true }
            );

            return interaction.reply({
                content: "🔓 Salon déverrouillé",
                ephemeral: true
            });
        }
    },

    // =========================
    // /slowmode
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("slowmode")
            .setDescription("Activer slowmode")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addIntegerOption(o =>
                o.setName("seconds")
                    .setDescription("Secondes")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const seconds = interaction.options.getInteger("seconds");

            await interaction.channel.setRateLimitPerUser(seconds);

            return interaction.reply({
                content: `⏳ Slowmode ${seconds}s`,
                ephemeral: true
            });
        }
    },

    // =========================
    // /roulette
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("roulette")
            .setDescription("Nombre aléatoire"),

        async execute(interaction) {

            const number = Math.floor(Math.random() * 100) + 1;

            return interaction.reply({
                content: `🎲 ${number}`
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
                .setTitle("📖 Aide")
                .setColor("Blue")
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

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
];
