const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

module.exports = [

/* =========================
   /tournage
========================= */
{
    data: new SlashCommandBuilder()
        .setName("tournage")
        .setDescription("Créer un tournoi")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(o =>
            o.setName("nom").setRequired(true))
        .addStringOption(o =>
            o.setName("horaire").setRequired(true))
        .addStringOption(o =>
            o.setName("description").setRequired(true)
        ),

    async execute(interaction) {

        const nom = interaction.options.getString("nom");
        const horaire = interaction.options.getString("horaire");
        const description = interaction.options.getString("description");

        const embed = new EmbedBuilder()
            .setTitle(`🏆 ${nom}`)
            .setColor("Gold")
            .addFields(
                { name: "Horaire", value: horaire },
                { name: "Description", value: description }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("participate_tournament")
                .setLabel("Participer")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ content: "Tournoi créé", ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
},

/* =========================
   /signal (FIX COMPLET)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("signal")
        .setDescription("Signaler un utilisateur")
        .addUserOption(o =>
            o.setName("utilisateur").setRequired(true))
        .addStringOption(o =>
            o.setName("raison").setRequired(true)),

    async execute(interaction, client, loadDB, saveDB) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");

        const db = loadDB();

        db.reports.push({
            userId: user.id,
            reporter: interaction.user.id,
            reason: reason
        });

        saveDB(db);

        await interaction.reply({
            content: `Signal envoyé sur <@${user.id}>`,
            ephemeral: true
        });
    }
},

/* =========================
   /supsignal
========================= */
{
    data: new SlashCommandBuilder()
        .setName("supsignal")
        .setDescription("Voir et supprimer tes signalements"),

    async execute(interaction, client, loadDB) {

        const db = loadDB();

        const mine = db.reports.filter(r => r.reporter === interaction.user.id);

        if (!mine.length) {
            return interaction.reply({ content: "Aucun signalement", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Tes signalements")
            .setDescription(
                mine.map((r, i) =>
                    `${i + 1}. <@${r.userId}> - ${r.reason}`
                ).join("\n")
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`delete_reports_${interaction.user.id}`)
                .setLabel("Supprimer mes signalements")
                .setStyle(ButtonStyle.Danger)
        );

        interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
},

/* =========================
   /voirsignal
========================= */
{
    data: new SlashCommandBuilder()
        .setName("voirsignal")
        .setDescription("Classement signalements")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction, client, loadDB) {

        const db = loadDB();

        const stats = {};

        for (const r of db.reports) {
            stats[r.userId] = (stats[r.userId] || 0) + 1;
        }

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => `<@${id}> ➜ ${count}`);

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Classement signalements")
                    .setDescription(sorted.join("\n") || "Aucun signalement")
                    .setColor("Red")
            ],
            ephemeral: true
        });
    }
},

/* =========================
   /kick
========================= */
{
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick un membre")
        .addUserOption(o => o.setName("user").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

    async execute(interaction) {

        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);

        await member.kick();

        interaction.reply({ content: "Kick effectué", ephemeral: true });
    }
},

/* =========================
   /ban
========================= */
{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban un membre")
        .addUserOption(o => o.setName("user").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {

        const user = interaction.options.getUser("user");
        await interaction.guild.members.ban(user.id);

        interaction.reply({ content: "Banni", ephemeral: true });
    }
},

/* =========================
   /clear
========================= */
{
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprimer messages")
        .addIntegerOption(o => o.setName("amount").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {

        const amount = interaction.options.getInteger("amount");
        await interaction.channel.bulkDelete(amount);

        interaction.reply({ content: "Messages supprimés", ephemeral: true });
    }
},

/* =========================
   /help
========================= */
{
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Aide"),

    async execute(interaction) {

        interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("Aide bot")
                    .setDescription("/signal /supsignal /voirsignal /kick /ban /clear /tournage")
            ],
            ephemeral: true
        });
    }
}

];
