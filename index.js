const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} = require("discord.js");

const commands = require("./commands");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();
global.reports = []; // "database" simple

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

    console.log("Commands OK");
});

client.on("interactionCreate", async (interaction) => {

    // SLASH
    if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (!cmd) return;

        try {
            await cmd.execute(interaction, client);
        } catch (e) {
            console.error(e);
            return interaction.reply({ content: "Erreur commande", ephemeral: true });
        }
    }

    // BUTTON SUPPRESSION SIGNALS
    if (interaction.isButton()) {

        if (interaction.customId === "delete_my_signals") {
            global.reports = global.reports.filter(r => r.userId !== interaction.user.id);

            return interaction.reply({
                content: "Tes signalements ont été supprimés.",
                ephemeral: true
            });
        }
    }
});

client.login(process.env.TOKEN);
