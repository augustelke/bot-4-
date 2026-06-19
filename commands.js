const {
    SlashCommandBuilder,
    EmbedBuilder,
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

        await interaction.reply({ content: "Tournoi créé.", ephemeral: true });

        await interaction.channel.send({ embeds: [embed] });
    }
},

/* =========================
   /signal (FIX 100%)
   👉 PROBLÈME RÉGLÉ
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
                .setDescription("Visible par tout le monde ?")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");
        const isPublic = interaction.options.getBoolean("public") ?? false;

        const msg = `🚨 SIGNAL
Utilisateur: <@${user.id}>
Raison: ${reason}`;

        await interaction.reply({
            content: "Signal envoyé.",
            ephemeral: true
        });

        if (isPublic) {
            await interaction.channel.send({ content: msg });
        }
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
/roulette
/help`
            );

        return interaction.reply({ embeds: [embed], ephemeral: true });
    }
}

];
