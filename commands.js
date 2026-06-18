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

        await interaction.reply({ content: "Tournoi créé.", ephemeral: true });

        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
},

/* =========================
   /signal (CORRIGÉ À 100%)
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
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");

        await interaction.reply({
            content: `🚨 Signal envoyé\nUtilisateur: <@${user.id}>\nRaison: ${reason}`,
            ephemeral: true
        });

        await interaction.channel.send({
            content: `🚨 SIGNAL\nUtilisateur: <@${user.id}>\nRaison: ${reason}`
        });
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
            .setDescription(`
/tournage
/signal
/roulette
/help
            `);

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

];
