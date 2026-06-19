const {
    Client,
    GatewayIntentBits,
    Collection,
    REST,
    Routes
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

global.reports = [];

// Chargement commandes
for (const cmd of commands) {

    if (!cmd.data || !cmd.execute) {
        console.log("Commande ignorée");
        continue;
    }

    client.commands.set(cmd.data.name, cmd);
}

// READY
client.once("ready", async () => {

    console.log(`${client.user.tag} connecté`);

    const rest = new REST({ version: "10" })
        .setToken(process.env.TOKEN);

    try {

        const slashCommands = [];

        for (const cmd of commands) {

            try {

                slashCommands.push(
                    cmd.data.toJSON()
                );

                console.log(`✅ ${cmd.data.name}`);

            } catch (err) {

                console.log(`❌ ERREUR : ${cmd.data?.name}`);
                console.error(err);
            }
        }

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            { body: slashCommands }
        );

        console.log("Slash commands enregistrées");

    } catch (err) {

        console.error("Erreur REST");
        console.error(err);
    }
});

// INTERACTIONS
client.on("interactionCreate", async interaction => {

    // COMMANDES
    if (interaction.isChatInputCommand()) {

        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command) return;

        try {

            await command.execute(
                interaction,
                client
            );

        } catch (err) {

            console.error(err);

            if (!interaction.replied) {

                await interaction.reply({
                    content: "Erreur commande.",
                    ephemeral: true
                });
            }
        }

        return;
    }

    // BOUTONS
    if (interaction.isButton()) {

        // supprimer ses propres signalements
        if (
            interaction.customId ===
            "delete_my_signals"
        ) {

            global.reports =
                global.reports.filter(
                    r =>
                        r.userId !==
                        interaction.user.id
                );

            return interaction.reply({
                content:
                    "Tes signalements ont été supprimés.",
                ephemeral: true
            });
        }

        // bouton tournoi
        if (
            interaction.customId ===
            "participate_tournament"
        ) {

            return interaction.reply({
                content:
                    "Participation enregistrée.",
                ephemeral: true
            });
        }
    }
});

// ERREURS
process.on(
    "unhandledRejection",
    console.error
);

process.on(
    "uncaughtException",
    console.error
);

client.login(process.env.TOKEN);
