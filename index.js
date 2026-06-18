const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits,
    SlashCommandBuilder
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const TOURNAMENT_CHANNEL = "1502721949376188478";

client.commands = new Collection();

// load commands
for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands.map(c => c.data.toJSON()) }
        );

        console.log("Slash commands enregistrées");
    } catch (err) {
        console.error(err);
    }
});

client.on("interactionCreate", async (interaction) => {

    // ================= SLASH COMMANDS =================
    if (interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction, client);
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: "Erreur commande.",
                ephemeral: true
            });
        }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

        // participation tournoi
        if (interaction.customId === "participate_tournament") {

            const modal = new ModalBuilder()
                .setCustomId("tournament_modal")
                .setTitle("Participation tournoi");

            const age = new TextInputBuilder()
                .setCustomId("age")
                .setLabel("Âge")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const platform = new TextInputBuilder()
                .setCustomId("platform")
                .setLabel("Plateforme")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const dispo = new TextInputBuilder()
                .setCustomId("dispo")
                .setLabel("Disponibilités")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(age),
                new ActionRowBuilder().addComponents(platform),
                new ActionRowBuilder().addComponents(dispo)
            );

            return interaction.showModal(modal);
        }

        // accept
        if (interaction.customId.startsWith("accept_")) {

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "Non autorisé.", ephemeral: true });
            }

            const userId = interaction.customId.split("_")[1];

            try {
                const user = await client.users.fetch(userId);
                await user.send("✅ Candidature acceptée.");
            } catch {}

            return interaction.message.delete();
        }

        // deny
        if (interaction.customId.startsWith("deny_")) {

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "Non autorisé.", ephemeral: true });
            }

            const userId = interaction.customId.split("_")[1];

            try {
                const user = await client.users.fetch(userId);
                await user.send("❌ Candidature refusée.");
            } catch {}

            return interaction.message.delete();
        }
    }

    // ================= MODALS =================
    if (interaction.isModalSubmit()) {

        // tournoi
        if (interaction.customId === "tournament_modal") {

            const age = interaction.fields.getTextInputValue("age");
            const platform = interaction.fields.getTextInputValue("platform");
            const dispo = interaction.fields.getTextInputValue("dispo");

            const embed = new EmbedBuilder()
                .setTitle("Nouvelle candidature")
                .addFields(
                    { name: "User", value: `<@${interaction.user.id}>` },
                    { name: "Âge", value: age },
                    { name: "Plateforme", value: platform },
                    { name: "Dispo", value: dispo }
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`accept_${interaction.user.id}`)
                    .setLabel("Accepter")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_${interaction.user.id}`)
                    .setLabel("Refuser")
                    .setStyle(ButtonStyle.Danger)
            );

            const channel = await client.channels.fetch(TOURNAMENT_CHANNEL);

            if (channel) {
                await channel.send({ embeds: [embed], components: [row] });
            }

            return interaction.reply({
                content: "Candidature envoyée.",
                ephemeral: true
            });
        }

        // signal (IMPORTANT FIX ICI)
        if (interaction.customId === "signal_modal") {

            const user = interaction.fields.getUser("user");
            const reason = interaction.fields.getTextInputValue("reason");

            const channel = interaction.channel;

            await channel.send({
                content: `🚨 Signalement\nUtilisateur: <@${user.id}>\nRaison: ${reason}`
            });

            return interaction.reply({
                content: "Signal envoyé.",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
