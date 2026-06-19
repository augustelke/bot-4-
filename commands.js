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
        .addStringOption(o => o.setName("nom").setDescription("Nom").setRequired(true))
        .addStringOption(o => o.setName("horaire").setDescription("Horaire").setRequired(true))
        .addStringOption(o => o.setName("description").setDescription("Description").setRequired(true)),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle("🏆 " + interaction.options.getString("nom"))
            .setColor("Gold")
            .addFields(
                { name: "Horaire", value: interaction.options.getString("horaire") },
                { name: "Description", value: interaction.options.getString("description") }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("participate_tournament")
                .setLabel("Participer")
                .setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ content: "OK tournoi créé", ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    }
},

/* =========================
   /signal
========================= */
{
    data: new SlashCommandBuilder()
        .setName("signal")
        .setDescription("Signaler un utilisateur")
        .addUserOption(o => o.setName("utilisateur").setDescription("Cible").setRequired(true))
        .addStringOption(o => o.setName("raison").setDescription("Raison").setRequired(true)),

    async execute(interaction) {

        const user = interaction.options.getUser("utilisateur");
        const reason = interaction.options.getString("raison");

        global.reports.push({
            id: Date.now().toString(),
            userId: interaction.user.id,
            targetId: user.id,
            reason
        });

        await interaction.reply({
            content: "Signal enregistré.",
            ephemeral: true
        });

        await interaction.channel.send(`🚨 SIGNAL <@${user.id}> : ${reason}`);
    }
},

/* =========================
   /supsignal
========================= */
{
    data: new SlashCommandBuilder()
        .setName("supsignal")
        .setDescription("Voir tes signalements"),

    async execute(interaction) {

        const reports = global.reports.filter(r => r.userId === interaction.user.id);

        if (!reports.length)
            return interaction.reply({ content: "Aucun signal.", ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle("Tes signals")
            .setColor("Red")
            .setDescription(
                reports.map(r => `ID: ${r.id}\n${r.reason}`).join("\n\n")
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("delete_my_signals")
                .setLabel("Supprimer mes signals")
                .setStyle(ButtonStyle.Danger)
        );

        return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
},

/* =========================
   /voirsignal (ADMIN)
========================= */
{
    data: new SlashCommandBuilder()
        .setName("voirsignal")
        .setDescription("Classement signals")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const stats = {};

        for (const r of global.reports) {
            stats[r.targetId] = (stats[r.targetId] || 0) + 1;
        }

        const sorted = Object.entries(stats)
            .sort((a,b)=>b[1]-a[1])
            .map(([id,c])=>`<@${id}> → ${c}`)
            .join("\n");

        return interaction.reply({
            content: sorted || "Aucun signal",
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
        .setDescription("Kick user")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setDescription("user").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);

        await member.kick();
        return interaction.reply({ content: "Kick OK", ephemeral: true });
    }
},

/* =========================
   /ban
========================= */
{
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban user")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setDescription("user").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        await interaction.guild.members.ban(user.id);
        return interaction.reply({ content: "Ban OK", ephemeral: true });
    }
},

/* =========================
   /mute
========================= */
{
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Timeout user")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(o => o.setName("user").setRequired(true))
        .addIntegerOption(o => o.setName("time").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const time = interaction.options.getInteger("time");

        const member = await interaction.guild.members.fetch(user.id);
        await member.timeout(time * 60000);

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
        return interaction.reply({ content: "Clear OK", ephemeral: true });
    }
},

/* =========================
   /lock
========================= */
{
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        return interaction.reply({ content: "Locked", ephemeral: true });
    }
},

/* =========================
   /unlock
========================= */
{
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock channel")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true
        });

        return interaction.reply({ content: "Unlocked", ephemeral: true });
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

        return interaction.reply({ content: "Slowmode OK", ephemeral: true });
    }
},

/* =========================
   /roulette
========================= */
{
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription("Random number"),

    async execute(interaction) {
        return interaction.reply("🎲 " + Math.floor(Math.random()*100));
    }
},

/* =========================
   /help
========================= */
{
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Help bot"),

    async execute(interaction) {

        return interaction.reply({
            content:
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
/roulette`,
            ephemeral: true
        });
    }
}

];
