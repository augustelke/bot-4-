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
            o.setName("nom").setDescription("Nom du tournoi").setRequired(true))
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

        await interaction.reply({ content: "Tournoi créé.", ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
},

/* =========================
   /signal (PRO PRESTO FIX)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("signal")
        .setDescription("Signaler un utilisateur")
        .addUserOption(o =>
            o.setName("utilisateur")
                .setDescription("Utilisateur à signaler")
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName("raison")
                .setDescription("Raison du signalement")
                .setRequired(true)
        )
        .addBooleanOption(o =>
            o.setName("public")
                .setDescription("Visible pour les autres ?")
                .setRequired(true)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");
        const isPublic = interaction.options.getBoolean("public");

        if (!global.reports) global.reports = [];

        const report = {
            id: Date.now().toString(),
            userId: interaction.user.id,
            targetId: user.id,
            reason,
            public: isPublic
        };

        global.reports.push(report);

        await interaction.reply({
            content: `🚨 Signal envoyé`,
            ephemeral: true
        });

        if (isPublic) {
            await interaction.channel.send(
                `🚨 SIGNAL\nUtilisateur: <@${user.id}>\nRaison: ${reason}`
            );
        }
    }
},

/* =========================
   /supsignal (MES SIGNALS + SUPPRESSION)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("supsignal")
        .setDescription("Voir et gérer tes signalements"),

    async execute(interaction) {

        const reports = (global.reports || []).filter(r => r.userId === interaction.user.id);

        if (!reports.length) {
            return interaction.reply({ content: "Aucun signal.", ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle("Tes signalements")
            .setColor("Red")
            .setDescription(
                reports.map(r => `ID: ${r.id}\nRaison: ${r.reason}\n---`).join("\n")
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("delete_reports")
                .setLabel("Supprimer mes signals")
                .setStyle(ButtonStyle.Danger)
        );

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
},

/* =========================
   /voirsignal (ADMIN TRI)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("voirsignal")
        .setDescription("Voir les signalements (tri)")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const reports = global.reports || [];

        const stats = {};

        for (const r of reports) {
            stats[r.targetId] = (stats[r.targetId] || 0) + 1;
        }

        const sorted = Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => `<@${id}> → ${count} signal(s)`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setTitle("📊 Classement signalements")
            .setColor("Orange")
            .setDescription(sorted || "Aucun signal");

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
},

/* =========================
   /roulette
========================= */
{
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Nombre aléatoire"),

    async execute(interaction) {
        const number = Math.floor(Math.random() * 100) + 1;
        return interaction.reply(`🎲 ${number}`);
    }
},

/* =========================
   /help
========================= */
{
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Aide du bot"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("📖 Aide")
            .setColor("Blue")
            .setDescription(
`/tournage
/signal
/supsignal
/voirsignal
/roulette`
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

];
