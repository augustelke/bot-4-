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
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

const TOURNAMENT_CHANNEL =
    "1502721949376188478";

client.commands = new Collection();

for (const command of commands) {
    client.commands.set(
        command.data.name,
        command
    );
}

if (!fs.existsSync("./database.json")) {
    fs.writeFileSync(
        "./database.json",
        JSON.stringify(
            {
                reports: [],
                warns: []
            },
            null,
            2
        )
    );
}

function loadDB() {
    return JSON.parse(
        fs.readFileSync(
            "./database.json",
            "utf8"
        )
    );
}

function saveDB(data) {
    fs.writeFileSync(
        "./database.json",
        JSON.stringify(
            data,
            null,
            2
        )
    );
}
client.once("ready", async () => {

    console.log(
        `${client.user.tag} connecté`
    );

    const rest = new REST({
        version: "10"
    }).setToken(
        process.env.TOKEN
    );

    try {

        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID
            ),
            {
                body: commands.map(
                    cmd =>
                        cmd.data.toJSON()
                )
            }
        );

        console.log(
            "Slash commands enregistrées"
        );

    } catch (err) {
        console.error(err);
    }

});
client.on(
    "interactionCreate",
    async interaction => {

        if (
            interaction.isChatInputCommand()
        ) {

            const command =
                client.commands.get(
                    interaction.commandName
                );

            if (!command) return;

            try {

                await command.execute(
                    interaction,
                    loadDB,
                    saveDB
                );

            } catch (err) {

                console.error(err);

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.followUp({
                        content:
                            "Une erreur est survenue.",
                        ephemeral: true
                    });

                } else {

                    await interaction.reply({
                        content:
                            "Une erreur est survenue.",
                        ephemeral: true
                    });

                }
            }
        }
              if (
            interaction.isButton()
        ) {

            if (
                interaction.customId ===
                "participate_tournament"
            ) {

                const modal =
                    new ModalBuilder()
                        .setCustomId(
                            "tournament_modal"
                        )
                        .setTitle(
                            "Participation"
                        );

                const age =
                    new TextInputBuilder()
                        .setCustomId(
                            "age"
                        )
                        .setLabel(
                            "Votre âge"
                        )
                        .setRequired(true)
                        .setStyle(
                            TextInputStyle.Short
                        );

                const platform =
                    new TextInputBuilder()
                        .setCustomId(
                            "platform"
                        )
                        .setLabel(
                            "Plateforme"
                        )
                        .setRequired(true)
                        .setStyle(
                            TextInputStyle.Short
                        );

                const dispo =
                    new TextInputBuilder()
                        .setCustomId(
                            "dispo"
                        )
                        .setLabel(
                            "Disponibilités"
                        )
                        .setRequired(true)
                        .setStyle(
                            TextInputStyle.Paragraph
                        );

                modal.addComponents(
                    new ActionRowBuilder()
                        .addComponents(
                            age
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            platform
                        ),
                    new ActionRowBuilder()
                        .addComponents(
                            dispo
                        )
                );

                return interaction.showModal(
                    modal
                );
            }
                            if (
                interaction.customId.startsWith(
                    "accept_"
                )
            ) {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.Administrator
                    )
                ) {

                    return interaction.reply({
                        content:
                            "Permission refusée.",
                        ephemeral: true
                    });

                }

                const userId =
                    interaction.customId.replace(
                        "accept_",
                        ""
                    );

                try {

                    const user =
                        await client.users.fetch(
                            userId
                        );

                    await user.send(
                        "✅ Votre candidature au tournoi a été acceptée."
                    );

                } catch {}

                await interaction.message.delete();
            }
                            if (
                interaction.customId.startsWith(
                    "deny_"
                )
            ) {

                if (
                    !interaction.member.permissions.has(
                        PermissionFlagsBits.Administrator
                    )
                ) {

                    return interaction.reply({
                        content:
                            "Permission refusée.",
                        ephemeral: true
                    });

                }

                const userId =
                    interaction.customId.replace(
                        "deny_",
                        ""
                    );

                try {

                    const user =
                        await client.users.fetch(
                            userId
                        );

                    await user.send(
                        "❌ Votre candidature au tournoi a été refusée."
                    );

                } catch {}

                await interaction.message.delete();
            }

            if (
                interaction.customId.startsWith(
                    "delete_report_"
                )
            ) {

                const reportId =
                    interaction.customId.replace(
                        "delete_report_",
                        ""
                    );

                const db =
                    loadDB();

                const report =
                    db.reports.find(
                        r =>
                            r.id ===
                            reportId
                    );

                if (
                    !report
                ) {

                    return interaction.reply({
                        content:
                            "Signalement introuvable.",
                        ephemeral: true
                    });

                }

                if (
                    report.author !==
                    interaction.user.id
                ) {

                    return interaction.reply({
                        content:
                            "Ce signalement ne vous appartient pas.",
                        ephemeral: true
                    });

                }

                db.reports =
                    db.reports.filter(
                        r =>
                            r.id !==
                            reportId
                    );

                saveDB(
                    db
                );

                return interaction.update({
                    content:
                        "✅ Signalement supprimé.",
                    embeds: [],
                    components: []
                });
            }
        }
              if (
            interaction.isModalSubmit()
        ) {

            if (
                interaction.customId ===
                "tournament_modal"
            ) {

                const age =
                    interaction.fields.getTextInputValue(
                        "age"
                    );

                const platform =
                    interaction.fields.getTextInputValue(
                        "platform"
                    );

                const dispo =
                    interaction.fields.getTextInputValue(
                        "dispo"
                    );

                const embed =
                    new EmbedBuilder()
                        .setTitle(
                            "Nouvelle candidature"
                        )
                        .addFields(
                            {
                                name:
                                    "Utilisateur",
                                value:
                                    `<@${interaction.user.id}>`
                            },
                            {
                                name:
                                    "Âge",
                                value:
                                    age
                            },
                            {
                                name:
                                    "Plateforme",
                                value:
                                    platform
                            },
                            {
                                name:
                                    "Disponibilités",
                                value:
                                    dispo
                            }
                        )
                        .setTimestamp();

                const row =
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId(
                                    `accept_${interaction.user.id}`
                                )
                                .setLabel(
                                    "Accepter"
                                )
                                .setStyle(
                                    ButtonStyle.Success
                                ),
                            new ButtonBuilder()
                                .setCustomId(
                                    `deny_${interaction.user.id}`
                                )
                                .setLabel(
                                    "Refuser"
                                )
                                .setStyle(
                                    ButtonStyle.Danger
                                )
                        );

                const channel =
                    await client.channels.fetch(
                        TOURNAMENT_CHANNEL
                    );

                if (
                    channel
                ) {

                    await channel.send({
                        embeds: [
                            embed
                        ],
                        components: [
                            row
                        ]
                    });

                }

                return interaction.reply({
                    content:
                        "✅ Votre candidature a été envoyée.",
                    ephemeral: true
                });
            }                            
            ) {

                const reason =
                    interaction.fields.getTextInputValue(
                        "reason"
                    );

                const db =
                    loadDB();

                const report = {
                    id:
                        Date.now().toString(),
                    author:
                        interaction.user.id,
                    reason,
                    createdAt:
                        Date.now()
                };

                db.reports.push(
                    report
                );

                saveDB(
                    db
                );

                return interaction.reply({
                    content:
                        "✅ Signalement enregistré.",
                    ephemeral: true
                });
            }
                            if (
                interaction.customId ===
                "signal_modal"
            ) {

                const reason =
                    interaction.fields.getTextInputValue(
                        "reason"
                    );

                const db =
                    loadDB();

                const report = {
                    id:
                        Date.now().toString(),
                    author:
                        interaction.user.id,
                    reason,
                    createdAt:
                        Date.now()
                };

                db.reports.push(
                    report
                );

                saveDB(
                    db
                );

                return interaction.reply({
                    content:
                        "✅ Signalement enregistré.",
                    ephemeral: true
                });
            }
                        }

    }
);
client.login(
    process.env.TOKEN
);
