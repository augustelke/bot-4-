const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

// MEMORY SIMPLE
const reports = [];

module.exports = [

/* =========================
   /tournage
========================= */
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
            .setColor("Gold")
            .addFields(
                { name: "Horaire", value: interaction.options.getString("horaire") },
                { name: "Description", value: interaction.options.getString("description") }
            );

        await interaction.reply({ content: "Tournoi créé.", ephemeral: true });
        await interaction.channel.send({ embeds: [embed] });
    }
},

/* =========================
   /signal (FIX 100%)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("signal")
        .setDescription("Signaler un utilisateur")
        .addUserOption(o => o.setName("utilisateur").setDescription("Utilisateur").setRequired(true))
        .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(true))
        .addBooleanOption(o => o.setName("public").setDescription("Visible ?")),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");
        const pub = interaction.options.getBoolean("public") ?? false;

        reports.push({
            id: Date.now(),
            userId: user.id,
            authorId: interaction.user.id,
            reason
        });

        await interaction.reply({ content: "Signal envoyé.", ephemeral: true });

        if (pub) {
            await interaction.channel.send(`🚨 SIGNAL\n<@${user.id}>\nRaison: ${reason}`);
        }
    }
},

/* =========================
   /supsignal
========================= */
{
    data: new SlashCommandBuilder()
        .setName("supsignal")
        .setDescription("Tes signalements"),

    async execute(interaction) {

        const userReports = reports.filter(r => r.authorId === interaction.user.id);

        if (!userReports.length) {
            return interaction.reply({ content: "Aucun signalement.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Tes signalements")
            .setDescription(
                userReports.map(r =>
                    `ID: ${r.id} | <@${r.userId}> | ${r.reason}`
                ).join("\n")
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("delete_my_reports")
                .setLabel("Supprimer mes signalements")
                .setStyle(ButtonStyle.Danger)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    },

    deleteReports(interaction) {
        const index = reports.findIndex(r => r.authorId === interaction.user.id);
        if (index === -1) {
            return interaction.reply({ content: "Rien à supprimer.", ephemeral: true });
        }

        for (let i = reports.length - 1; i >= 0; i--) {
            if (reports[i].authorId === interaction.user.id) {
                reports.splice(i, 1);
            }
        }

        interaction.reply({ content: "Signalements supprimés.", ephemeral: true });
    }
},

/* =========================
   /voirsignal (ADMIN)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("voirsignal")
        .setDescription("Classement signalements")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const stats = {};

        for (const r of reports) {
            stats[r.userId] = (stats[r.userId] || 0) + 1;
        }

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1] - a[1]);

        const embed = new EmbedBuilder()
            .setTitle("📊 Signalements")
            .setDescription(
                sorted.length
                    ? sorted.map(([id, count]) => `<@${id}> - ${count}`).join("\n")
                    : "Aucun signal"
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
},

/* =========================
   /kick
========================= */
{
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Kick membre")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);

        await member.kick();
        return interaction.reply({ content: "Kick effectué", ephemeral: true });
    }
},

/* =========================
   /ban
========================= */
{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban membre")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        await interaction.guild.members.ban(user.id);
        return interaction.reply({ content: "Banni", ephemeral: true });
    }
},

/* =========================
   /mute
========================= */
{
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Timeout")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setRequired(true))
        .addIntegerOption(o => o.setName("minutes").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const mins = interaction.options.getInteger("minutes");

        const member = await interaction.guild.members.fetch(user.id);
        await member.timeout(mins * 60000);

        return interaction.reply({ content: "Mute OK", ephemeral: true });
    }
},

/* =========================
   /clear
========================= */
{
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Clear messages")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(o => o.setName("amount").setRequired(true)),

    async execute(interaction) {
        const amount = interaction.options.getInteger("amount");
        await interaction.channel.bulkDelete(amount);

        return interaction.reply({ content: "Messages supprimés", ephemeral: true });
    }
},

/* =========================
   /lock
========================= */
{
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock salon")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        return interaction.reply({ content: "Salon lock", ephemeral: true });
    }
},

/* =========================
   /unlock
========================= */
{
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock salon")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true
        });

        return interaction.reply({ content: "Salon unlock", ephemeral: true });
    }
},

/* =========================
   /slowmode
========================= */
{
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Slowmode")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(o => o.setName("seconds").setRequired(true)),

    async execute(interaction) {
        const s = interaction.options.getInteger("seconds");
        await interaction.channel.setRateLimitPerUser(s);

        return interaction.reply({ content: "Slowmode activé", ephemeral: true });
    }
},

/* =========================
   /roulette
========================= */
{
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Random"),

    async execute(interaction) {
        const n = Math.floor(Math.random() * 100);
        return interaction.reply(`🎲 ${n}`);
    }
},

/* =========================
   /help
========================= */
{
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("Help")
            .setDescription(
`/tournage
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
/roulette`
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

];
