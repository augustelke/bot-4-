const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const TOURNAMENT_CHANNEL = "1502721949376188478";

module.exports = [

    // =========================
    // /tournage
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("tournage")
            .setDescription("Créer un tournoi")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true))
            .addStringOption(o => o.setName("horaire").setDescription("Horaire").setRequired(true))
            .addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${interaction.options.getString("nom")}`)
                .addFields(
                    { name: "📅 Horaire", value: interaction.options.getString("horaire") },
                    { name: "📝 Description", value: interaction.options.getString("description") }
                )
                .setColor("Gold");

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("participate_tournament")
                    .setLabel("Participer")
                    .setStyle(ButtonStyle.Success)
            );

            const channel = await interaction.client.channels.fetch(TOURNAMENT_CHANNEL);

            if (channel) {
                await channel.send({ embeds: [embed], components: [row] });
            }

            return interaction.reply({ content: "Tournoi créé.", ephemeral: true });
        }
    },

    // =========================
    // /signal
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("signal")
            .setDescription("Envoyer un signalement")
            .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(true)),

        async execute(interaction, loadDB, saveDB) {

            const db = loadDB();

            db.reports.push({
                id: Date.now().toString(),
                userId: interaction.user.id,
                reason: interaction.options.getString("raison"),
                createdAt: Date.now()
            });

            saveDB(db);

            return interaction.reply({ content: "✅ Signalement envoyé", ephemeral: true });
        }
    },

    // =========================
    // /supsignal
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir ses signalements"),

        async execute(interaction, loadDB, saveDB) {

            const db = loadDB();

            const userReports = db.reports.filter(r => r.userId === interaction.user.id);

            if (!userReports.length) {
                return interaction.reply({ content: "Aucun signalement.", ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle("Tes signalements")
                .setDescription(userReports.map(r => `• ${r.reason} (ID: ${r.id})`).join("\n"))
                .setColor("Red");

            const row = new ActionRowBuilder().addComponents(
                userReports.slice(0, 5).map(r =>
                    new ButtonBuilder()
                        .setCustomId(`delete_report_${r.id}`)
                        .setLabel("Supprimer")
                        .setStyle(ButtonStyle.Danger)
                )
            );

            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    },

    // =========================
    // /voirsignal
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Voir signalements (admin)")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction, loadDB) {

            const db = loadDB();

            const stats = {};

            for (const r of db.reports) {
                stats[r.userId] = (stats[r.userId] || 0) + 1;
            }

            const text = Object.entries(stats)
                .map(([id, count]) => `<@${id}> : ${count}`)
                .join("\n");

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📊 Signalements")
                        .setDescription(text || "Aucun signalement")
                        .setColor("Orange")
                ],
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
            .addUserOption(o => o.setName("user").setDescription("Utilisateur").setRequired(true)),

        async execute(interaction) {
            const user = interaction.options.getUser("user");
            const member = await interaction.guild.members.fetch(user.id);
            await member.kick();

            return interaction.reply({ content: `👢 ${user.tag} kick`, ephemeral: true });
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
            .addUserOption(o => o.setName("user").setDescription("Utilisateur").setRequired(true)),

        async execute(interaction) {
            const user = interaction.options.getUser("user");
            await interaction.guild.members.ban(user.id);

            return interaction.reply({ content: `🔨 ${user.tag} ban`, ephemeral: true });
        }
    },

    // =========================
    // /mute
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("mute")
            .setDescription("Timeout")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addUserOption(o => o.setName("user").setRequired(true))
            .addIntegerOption(o => o.setName("minutes").setRequired(true)),

        async execute(interaction) {
            const user = interaction.options.getUser("user");
            const minutes = interaction.options.getInteger("minutes");

            const member = await interaction.guild.members.fetch(user.id);
            await member.timeout(minutes * 60000);

            return interaction.reply({ content: `🔇 ${user.tag} mute`, ephemeral: true });
        }
    },

    // =========================
    // /clear
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Supprimer messages")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addIntegerOption(o => o.setName("amount").setRequired(true)),

        async execute(interaction) {
            const amount = interaction.options.getInteger("amount");
            await interaction.channel.bulkDelete(amount);

            return interaction.reply({ content: "🧹 supprimé", ephemeral: true });
        }
    },

    // =========================
    // /lock
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("lock")
            .setDescription("Lock salon")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            });

            return interaction.reply({ content: "🔒 lock", ephemeral: true });
        }
    },

    // =========================
    // /unlock
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("unlock")
            .setDescription("Unlock salon")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {
            await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: true
            });

            return interaction.reply({ content: "🔓 unlock", ephemeral: true });
        }
    },

    // =========================
    // /slowmode
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("slowmode")
            .setDescription("Slowmode")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addIntegerOption(o => o.setName("seconds").setRequired(true)),

        async execute(interaction) {
            const seconds = interaction.options.getInteger("seconds");

            await interaction.channel.setRateLimitPerUser(seconds);

            return interaction.reply({ content: `⏳ ${seconds}s`, ephemeral: true });
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
            const n = Math.floor(Math.random() * 100) + 1;
            return interaction.reply(`🎲 ${n}`);
        }
    },

    // =========================
    // /help
    // =========================
    {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Aide"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("📖 Help")
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

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }

];
