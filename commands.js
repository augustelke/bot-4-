const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const reports = []; // mémoire simple (pas de database)

module.exports = [

    // ================= HELP =================
    {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Affiche toutes les commandes du bot"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("📖 Aide du bot")
                .setColor("Blue")
                .setDescription(`
🎟️ /tournage → Créer un tournoi (admin)
🚨 /signal → Envoyer un signalement
📋 /supsignal → Voir ses signalements
📊 /voirsignal → Voir signalements (admin)

🛡️ Modération:
/kick /ban /mute /clear /lock /unlock /slowmode

🎲 Fun:
/roulette
                `);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    // ================= TOURNAGE =================
    {
        data: new SlashCommandBuilder()
            .setName("tournage")
            .setDescription("Créer un tournoi (admin uniquement)")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(o =>
                o.setName("nom")
                    .setDescription("Nom du tournoi")
                    .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("horaire")
                    .setDescription("Horaire du tournoi")
                    .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("description")
                    .setDescription("Description du tournoi")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const nom = interaction.options.getString("nom");
            const horaire = interaction.options.getString("horaire");
            const desc = interaction.options.getString("description");

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${nom}`)
                .setColor("Gold")
                .addFields(
                    { name: "📅 Horaire", value: horaire },
                    { name: "📝 Description", value: desc }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("participate_tournament")
                    .setLabel("Participer")
                    .setStyle(ButtonStyle.Success)
            );

            await interaction.reply({ content: "Tournoi créé", ephemeral: true });

            const channel = await interaction.client.channels.fetch("1502721949376188478");
            if (channel) channel.send({ embeds: [embed], components: [row] });
        }
    },

    // ================= SIGNAL =================
    {
        data: new SlashCommandBuilder()
            .setName("signal")
            .setDescription("Envoyer un signalement")
            .addStringOption(o =>
                o.setName("raison")
                    .setDescription("Raison du signalement")
                    .setRequired(true)
            ),

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
            .setDescription("Voir ses signalements"),

        async execute(interaction) {

            const userReports = reports.filter(r => r.user === interaction.user.id);

            if (!userReports.length)
                return interaction.reply({ content: "Aucun signalement", ephemeral: true });

            return interaction.reply({
                content: userReports.map(r => `ID: ${r.id} | ${r.reason}`).join("\n"),
                ephemeral: true
            });
        }
    },

    // ================= VOIR SIGNAL (ADMIN) =================
    {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Voir tous les signalements (admin)")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {

            if (!reports.length)
                return interaction.reply({ content: "Aucun signalement", ephemeral: true });

            return interaction.reply({
                content: reports.map(r => `<@${r.user}> - ${r.reason}`).join("\n"),
                ephemeral: true
            });
        }
    },

    // ================= KICK =================
    {
        data: new SlashCommandBuilder()
            .setName("kick")
            .setDescription("Expulser un membre")
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

            return interaction.reply({ content: `${user.tag} kick`, ephemeral: true });
        }
    },

    // ================= BAN =================
    {
        data: new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Bannir un membre")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addUserOption(o =>
                o.setName("user")
                    .setDescription("Utilisateur")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const user = interaction.options.getUser("user");

            await interaction.guild.members.ban(user.id);

            return interaction.reply({ content: `${user.tag} ban`, ephemeral: true });
        }
    },

    // ================= ROULETTE =================
    {
        data: new SlashCommandBuilder()
            .setName("roulette")
            .setDescription("Nombre aléatoire"),

        async execute(interaction) {

            const number = Math.floor(Math.random() * 100) + 1;

            return interaction.reply(`🎲 ${number}`);
        }
    }
];
