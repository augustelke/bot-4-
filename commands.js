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
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
            .addStringOption(option =>
                option.setName("nom")
                    .setDescription("Nom du tournoi")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("horaire")
                    .setDescription("Horaire du tournoi")
                    .setRequired(true)
            )
            .addStringOption(option =>
                option.setName("description")
                    .setDescription("Description du tournoi")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const nom = interaction.options.getString("nom");
            const horaire = interaction.options.getString("horaire");
            const description = interaction.options.getString("description");

            const embed = new EmbedBuilder()
                .setTitle(`🏆 ${nom}`)
                .addFields(
                    { name: "📅 Horaire", value: horaire },
                    { name: "📝 Description", value: description }
                )
                .setColor("Gold");

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId("participate_tournament")
                        .setLabel("Participer")
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.reply({
                content: "Tournoi créé.",
                ephemeral: true
            });

            const channel = await interaction.client.channels.fetch(TOURNAMENT_CHANNEL);

            if (channel) {
                await channel.send({
                    embeds: [embed],
                    components: [row]
                });
            }
        }
    }

];
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

module.exports = [
      {
        data: new SlashCommandBuilder()
            .setName("signal")
            .setDescription("Envoyer un signalement")
            .addStringOption(option =>
                option.setName("raison")
                    .setDescription("Raison du signalement")
                    .setRequired(true)
            ),

        async execute(interaction, loadDB, saveDB) {

            const reason = interaction.options.getString("raison");

            const db = loadDB();

            const report = {
                id: Date.now().toString(),
                userId: interaction.user.id,
                reason: reason,
                date: Date.now()
            };

            db.reports.push(report);
            saveDB(db);

            return interaction.reply({
                content: "✅ Signalement envoyé.",
                ephemeral: true
            });
        }
    },
      {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir et supprimer ses signalements"),

        async execute(interaction, loadDB, saveDB) {

            const db = loadDB();

            const userReports = db.reports.filter(
                r => r.userId === interaction.user.id
            );

            if (userReports.length === 0) {
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

            const buttons = userReports.slice(0, 5).map(r =>
                new ButtonBuilder()
                    .setCustomId(`delete_report_${r.id}`)
                    .setLabel(`Supprimer ${r.id}`)
                    .setStyle(ButtonStyle.Danger)
            );

            const row = new ActionRowBuilder()
                .addComponents(buttons);

            return interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }
    },
  ];
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

module.exports = [
      {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Voir les signalements (admin uniquement)")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

        async execute(interaction, loadDB) {

            const db = loadDB();

            if (db.reports.length === 0) {
                return interaction.reply({
                    content: "Aucun signalement.",
                    ephemeral: true
                });
            }

            const stats = {};

            for (const r of db.reports) {
                stats[r.userId] =
                    (stats[r.userId] || 0) + 1;
            }

            const sorted = Object.entries(stats)
                .sort((a, b) => b[1] - a[1]);

            const text = sorted
                .map(([id, count]) =>
                    `<@${id}> - ${count} signalements`
                )
                .join("\n");

            const embed = new EmbedBuilder()
                .setTitle("📊 Signalements")
                .setDescription(text)
                .setColor("Orange");

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    },
      {
        data: new SlashCommandBuilder()
            .setName("kick")
            .setDescription("Kick un membre")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
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
      {
        data: new SlashCommandBuilder()
            .setName("ban")
            .setDescription("Ban un membre")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
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
      {
        data: new SlashCommandBuilder()
            .setName("mute")
            .setDescription("Timeout un membre")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
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

            await member.timeout(minutes * 60 * 1000);

            return interaction.reply({
                content: `🔇 ${user.tag} mute ${minutes} min`,
                ephemeral: true
            });
        }
    },
      {
        data: new SlashCommandBuilder()
            .setName("clear")
            .setDescription("Supprimer des messages")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
            .addIntegerOption(o =>
                o.setName("amount")
                    .setDescription("Nombre")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const amount = interaction.options.getInteger("amount");

            await interaction.channel.bulkDelete(amount);

            return interaction.reply({
                content: `🧹 ${amount} messages supprimés`,
                ephemeral: true
            });
        }
    },
      {
        data: new SlashCommandBuilder()
            .setName("lock")
            .setDescription("Verrouiller salon")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

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
      {
        data: new SlashCommandBuilder()
            .setName("unlock")
            .setDescription("Déverrouiller salon")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

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
      {
        data: new SlashCommandBuilder()
            .setName("slowmode")
            .setDescription("Activer slowmode")
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            )
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
];
module.exports = [
   {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Affiche toutes les commandes du bot"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("📖 Aide du bot")
                .setColor("Blue")
                .setDescription(`
**🎟️ Tournoi**
/tournage → Créer un tournoi (admin)
/signal → Envoyer un signalement
/supsignal → Voir ses signalements
/voirsignal → Voir tous les signalements (admin)

**🛡️ Modération (admin)**
/kick → Expulser un membre
/ban → Bannir un membre
/mute → Timeout un membre
/clear → Supprimer des messages
/lock → Verrouiller un salon
/unlock → Déverrouiller un salon
/slowmode → Activer le slowmode

**🎲 Fun**
/roulette → Génère un nombre aléatoire

**ℹ️ Autre**
/help → Affiche ce message
                `);

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
   }
];
