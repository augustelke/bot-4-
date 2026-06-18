require("dotenv").config();

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

const fs = require("fs");
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

// ================= DATABASE =================
if (!fs.existsSync("./database.json")) {
    fs.writeFileSync("./database.json", JSON.stringify({ reports: [] }, null, 2));
}

const loadDB = () => JSON.parse(fs.readFileSync("./database.json", "utf8"));
const saveDB = (data) => fs.writeFileSync("./database.json", JSON.stringify(data, null, 2));

// ================= READY =================
client.once("ready", async () => {
    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        {
            body: commands.map(c => c.data.toJSON())
        }
    );

    console.log("Slash commands OK");
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async interaction => {

    // COMMANDS
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.execute(interaction, loadDB, saveDB, client);
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: "Erreur bot", ephemeral: true });
        }
    }

    // BUTTONS
    if (interaction.isButton()) {

        if (interaction.customId === "participate_tournament") {

            const modal = new ModalBuilder()
                .setCustomId("tournament_modal")
                .setTitle("Tournoi");

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

            return interaction.showModal(
                new ActionRowBuilder().addComponents(age),
                new ActionRowBuilder().addComponents(platform),
                new ActionRowBuilder().addComponents(dispo)
            );
        }

        if (interaction.customId.startsWith("accept_")) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
                return interaction.reply({ content: "No perms", ephemeral: true });

            const id = interaction.customId.split("_")[1];

            try {
                const user = await client.users.fetch(id);
                await user.send("✅ Accepté");
            } catch {}

            return interaction.message.delete();
        }

        if (interaction.customId.startsWith("deny_")) {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator))
                return interaction.reply({ content: "No perms", ephemeral: true });

            const id = interaction.customId.split("_")[1];

            try {
                const user = await client.users.fetch(id);
                await user.send("❌ Refusé");
            } catch {}

            return interaction.message.delete();
        }

        if (interaction.customId.startsWith("delete_report_")) {

            const id = interaction.customId.replace("delete_report_", "");
            const db = loadDB();

            db.reports = db.reports.filter(r => r.id !== id);
            saveDB(db);

            return interaction.update({
                content: "Supprimé",
                embeds: [],
                components: []
            });
        }
    }

    // MODAL
    if (interaction.isModalSubmit()) {

        if (interaction.customId === "tournament_modal") {

            const embed = new EmbedBuilder()
                .setTitle("Candidature")
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

            return interaction.reply({ content: "Envoyé", ephemeral: true });
        }

        if (interaction.customId === "signal_modal") {

            const db = loadDB();

            db.reports.push({
                id: Date.now().toString(),
                userId: interaction.user.id,
                reason: interaction.fields.getTextInputValue("reason"),
                createdAt: Date.now()
            });

            saveDB(db);

            return interaction.reply({ content: "Signal envoyé", ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);
