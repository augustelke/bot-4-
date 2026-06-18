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
    PermissionFlagsBits
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

const TOURNAMENT_CHANNEL = "1502721949376188478";

client.commands = new Collection();

for (const cmd of commands) {
    client.commands.set(cmd.data.name, cmd);
}

client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands.map(c => c.data.toJSON()) }
    );

    console.log("Slash commands enregistrées");
});

client.on("interactionCreate", async (interaction) => {

    // ================= COMMANDS =================
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (e) {
            console.error(e);
            return interaction.reply({
                content: "Erreur commande",
                ephemeral: true
            });
        }
    }

    // ================= BUTTONS =================
    if (interaction.isButton()) {

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

        // ACCEPT / DENY
        if (interaction.customId.startsWith("accept_") || interaction.customId.startsWith("deny_")) {

            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ content: "No permission", ephemeral: true });
            }

            const userId = interaction.customId.split("_")[1];
            const user = await client.users.fetch(userId);

            if (interaction.customId.startsWith("accept_")) {
                await user.send("✅ Accepté tournoi");
            } else {
                await user.send("❌ Refusé tournoi");
            }

            await interaction.message.delete();
        }
    }

    // ================= MODAL =================
    if (interaction.isModalSubmit()) {

        if (interaction.customId === "tournament_modal") {

            const embed = new EmbedBuilder()
                .setTitle("Nouvelle candidature")
                .addFields(
                    { name: "User", value: `<@${interaction.user.id}>` },
                    { name: "Âge", value: interaction.fields.getTextInputValue("age") },
                    { name: "Plateforme", value: interaction.fields.getTextInputValue("platform") },
                    { name: "Dispo", value: interaction.fields.getTextInputValue("dispo") }
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

            await channel.send({ embeds: [embed], components: [row] });

            return interaction.reply({
                content: "Envoyé",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
