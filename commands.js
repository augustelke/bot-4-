const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");

// ================= DATABASE SIMPLE =================
const DB_PATH = "./database.json";

function loadDB() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify({ reports: [] }, null, 2));
    }
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = [

    // ================= HELP =================
    {
        data: new SlashCommandBuilder()
            .setName("help")
            .setDescription("Affiche toutes les commandes"),

        async execute(interaction) {

            const embed = new EmbedBuilder()
                .setTitle("📖 BOT PRO - HELP")
                .setColor("Blue")
                .setDescription(`
🎟️ **Tournoi**
/tournage

🚨 **Signalements**
/signal
/supsignal
/voirsignal

🛡️ **Modération**
/kick /ban /mute /clear /lock /unlock /slowmode

🎲 **Fun**
/roulette
                `);

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    // ================= TOURNAGE =================
    {
        data: new SlashCommandBuilder()
            .setName("tournage")
            .setDescription("Créer un tournoi (admin)")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .addStringOption(o =>
                o.setName("nom")
                    .setDescription("Nom du tournoi")
                    .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("horaire")
                    .setDescription("Horaire")
                    .setRequired(true)
            )
            .addStringOption(o =>
                o.setName("description")
                    .setDescription("Description")
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
                    .setDescription("Raison")
                    .setRequired(true)
            ),

        async execute(interaction) {

            const db = loadDB();

            db.reports.push({
                id: Date.now().toString(),
                user: interaction.user.id,
                reason: interaction.options.getString("raison"),
                date: Date.now()
            });

            saveDB(db);

            return interaction.reply({
                content: "✅ Signalement envoyé",
                ephemeral: true
            });
        }
    },

    // ================= SUP SIGNAL =================
    {
        data: new SlashCommandBuilder()
            .setName("supsignal")
            .setDescription("Voir ses signalements"),

        async execute(interaction) {

            const db = loadDB();
            const reports = db.reports.filter(r => r.user === interaction.user.id);

            if (!reports.length)
                return interaction.reply({ content: "Aucun signalement", ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle("📋 Tes signalements")
                .setColor("Red")
                .setDescription(
                    reports.map(r =>
                        `🆔 ${r.id} - ${r.reason}`
                    ).join("\n")
                );

            const row = new ActionRowBuilder().addComponents(
                reports.slice(0, 5).map(r =>
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

    // ================= VOIR SIGNAL (ADMIN) =================
    {
        data: new SlashCommandBuilder()
            .setName("voirsignal")
            .setDescription("Voir tous les signalements")
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

        async execute(interaction) {

            const db = loadDB();

            if (!db.reports.length)
                return interaction.reply({ content: "Aucun signalement", ephemeral: true });

            const embed = new EmbedBuilder()
                .setTitle("📊 Signalements globaux")
                .setColor("Orange")
                .setDescription(
                    db.reports.map(r =>
                        `<@${r.user}> → ${r.reason}`
                    ).join("\n")
                );

            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },

    // ================= KICK =================
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

            return interaction.reply({ content: `👢 ${user.tag} kick`, ephemeral: true });
        }
    },

    // ================= BAN =================
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

            return interaction.reply({ content: `🔨 ${user.tag} ban`, ephemeral: true });
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
