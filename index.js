const Discord = require('discord.js');
const { token } = require('./config.json');
const { ActivityType } = require('discord.js');
const mutedRoleId = '1091375321250537582'; // ID of the "Muted" role
const MUTE_ROLE_NAME = 'Muted';
const GUILD_ID = '1077217012427796500'


const ROLE_NAME = 'Community';
const prefix = "!";


const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGES
  ]
});
client.on('ready', () => {
  setInterval(updatePresence, 300000);
  updatePresence();
  console.log(`Ich bin Online!`)
});

/// WARN

client.on('message', message => {
  if (message.author.bot) return; // Verhindert, dass der Bot auf eigene Nachrichten reagiert

  if (message.content.startsWith('!warn')) {
    // ‹berpr¸fen, ob der Autor der Nachricht Administrator ist
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Du hast keine Berechtigung, diesen Befehl auszuf¸hren!');
    }

    // Den Befehl "!warn" analysieren
    const args = message.content.split(' ');
    const user = message.mentions.users.first(); // Den erw‰hnten Benutzer erhalten
    const reason = args.slice(2).join(' '); // Den Grund erhalten

    if (!user) {
      // Wenn kein Benutzer erw‰hnt wurde
      return message.reply('Du musst einen Benutzer erw‰hnen, den du warnen mˆchtest!');
    }

    if (!reason) {
      // Wenn kein Grund angegeben wurde
      return message.reply('Du musst einen Grund angeben!');
    }

    // Warnnachricht erstellen
    const warnMessage = `Du wurdest von ${message.author} gewarnt f¸r: ${reason}`;

    // Den Benutzer warnen
    user.send(warnMessage)
      .then(() => message.reply('Der Benutzer wurde erfolgreich gewarnt!'))
      .catch(error => {
        console.error(`Fehler beim Senden der Warnnachricht an ${user.tag}: ${error}`);
        message.reply('Es gab einen Fehler beim Warnen des Benutzers!');
      });
  }
});


/// STATUS

function updatePresence() {
    const guild = client.guilds.cache.get(GUILD_ID);
    const memberCount = guild.memberCount;
    const hour = new Date().getHours();

    if (hour >= 8 && hour < 21) {
        // loop through the members and count the bots
        let botCount = 0;

        guild.members.fetch().then((fetchedMembers) => {
            fetchedMembers.forEach((member) => {
                if (member.user.bot) botCount++;
            });

            // Set Activity

            client.user.setPresence({
                activities: [
                    { name: ` ${memberCount - botCount} Members | !hilfe`, type: "WATCHING" },
                ],
                status: 'online',
            });
        });
    } else {
        // Set Activity

        client.user.setPresence({
            activities: [{ name: 'dreaming about racoon cookies | !hilfe', type: "PLAYING" }],
            status: 'idle',
        });
    }
}


client.on('guildMemberAdd', (member) => {
  if (!member.user) return;
  console.log(`User ${member.user.tag} has joined the server!`);

  const role = member.guild.roles.cache.find((r) => r.name === ROLE_NAME);
  if (role) {
    member.roles.add(role);
    console.log(`Assigned role ${role.name} to ${member.user.tag}`);
  } else {
    console.log(`Role ${ROLE_NAME} not found`);
  }

  const channel = member.guild.channels.cache.find((ch) => ch.name === "willkommen");
  if (!channel) return;

  channel.send(`Willkommen auf RaknCommunity, ${member}!`);
  member.send("Herzlich Willkommen auf RaknCommunity!");
});





client.on('messageCreate', async (message) => {
  if (message.author.bot)
    return;
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift();
    switch (command) {
      case 'ping':
        const msg = await message.reply('Loading...');
        await msg.edit(`Pong! ;D`);
        break;
    }
  }
});




client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift();

    switch (command) {
      case 'mute':
        if (!message.member.permissions.has('MANAGE_ROLES')) {
          message.reply('Du hast keine Berechtigung, um Benutzer stummzuschalten.');
          return;
        }

        const user = message.mentions.users.first();
        if (!user) {
          message.reply('Bitte erw√§hne den Benutzer, den du stumm schalten m√∂chtest.');
          return;
        }

        const member = message.guild.members.cache.get(user.id);
        if (!member) {
          message.reply('Der Benutzer ist nicht auf diesem Server.');
          return;
        }

        const muteRoleName = 'Muted';
        let muteRole = message.guild.roles.cache.find(role => role.name === muteRoleName);

        if (!muteRole) {
          try {
            muteRole = await message.guild.roles.create({
              name: muteRoleName,
              color: '#000000',
              permissions: []
            });

            message.guild.channels.cache.forEach(async (channel) => {
              amessage.channel.permissionOverwrites.create(muteRole, {
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                SPEAK: false
              });
            });
          } catch (err) {
            console.log(err);
            message.reply('Es gab ein Problem beim Erstellen der Mute-Rolle.');
            return;
          }
        }

        member.roles.add(muteRole)
          .then(() => {
            message.reply(`Der Benutzer ${user.tag} wurde erfolgreich stummgeschaltet.`);
          })
          .catch(err => {
            console.log(err);
            message.reply('Es gab ein Problem beim Stummschalten des Benutzers.');
          });
        break;

      case 'unmute':
        if (!message.member.permissions.has("MANAGE_ROLES")) {
          message.channel.send("Du hast keine Berechtigung, um den Befehl auszuf√ºhren.");
          return;
        }

        if (!args[0]) {
          message.channel.send("Du musst einen Benutzer angeben, um ihn zu entmuten. Verwende `!unmute @Benutzer`.");
          return;
        }

        const target = message.mentions.members.first();
        if (!target) {
          message.channel.send("Dieser Benutzer wurde nicht gefunden. Bitte erneut versuchen.");
          return;
        }

        const role = message.guild.roles.cache.find(r => r.name === "Muted");
        if (!role || !target.roles.cache.has(role.id)) {
          message.channel.send("Dieser Benutzer ist nicht stummgeschaltet.");
          return;
        }

        try {
          await target.roles.remove(role);
          message.channel.send(`${target} wurde erfolgreich entstummt.`);
        } catch (err) {
          console.log(err);
          message.channel.send("Es gab ein Problem beim Entstummen des Benutzers.");
        }
        break;

      default:
        break;
    }
  }
});


client.on('messageCreate', (message) => {
  const command = '!user';

  if (message.content.startsWith(command)) {
    const guild = message.guild;
    message.channel.send(`Es gibt ${guild.memberCount} Mitglieder + Bots auf diesem Server.`);
  }
});

client.on('messageCreate', message => {
  if (message.content.startsWith('!clear')) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('Du hast nicht die erforderlichen Berechtigungen, um Nachrichten zu l√∂schen!');
    }
    const args = message.content.slice(1).trim().split(/ +/);
    const amount = parseInt(args[1]);

    if (isNaN(amount)) {
      return message.reply('Gib bitte eine g√ºltige Anzahl von Nachrichten an, die gel√∂scht werden sollen!');
    } else if (amount < 1 || amount > 100) {
      return message.reply('Du kannst nur zwischen 1 und 100 Nachrichten l√∂schen!');
    }

    message.channel.bulkDelete(amount)
      .then(messages => message.channel.send(`Ich habe erfolgreich ${messages.size} Nachrichten gel√∂scht!`))
      .catch(error => {
        console.error(error);
        message.channel.send('Beim L√∂schen der Nachrichten ist ein Fehler aufgetreten!');
      });
  }
});

/// BOT HUNGER 

let botHunger = 100; // Startwert f¸r den Hunger des Bots

// Funktion zum Verlust des Hungers nach einer Minute, aber nur zwischen 8 Uhr morgens und 21 Uhr abends
setInterval(() => {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 8 && hour < 21) {
    botHunger -= 10;
    if (botHunger < 0) {
      botHunger = 0;
    } else if (botHunger < 50) {
      const channel1 = client.channels.cache.get('1100112204843450429');
      channel1.send(`@everyone, Ich habe Hunger! Mein Hungerlevel ist bei ${botHunger}%. **!feed** `);
    }
  }
}, 3600000);


client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === `${prefix}hunger`) {
    message.reply(`Mein Hungerlevel: ${botHunger}%`);
  }

  /// SETHUNGER LVL

  if (message.content.startsWith(`${prefix}sethunger`)) {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
      return message.reply("Du hast keine Berechtigung, den Hungerwert des Bots zu ‰ndern.");
    }

    const newHunger = parseInt(message.content.split(' ')[1]);
    if (isNaN(newHunger) || newHunger < 0 || newHunger > 100) {
      return message.reply("Bitte gib einen g¸ltigen Wert zwischen 0 und 100 an.");
    }

    botHunger = newHunger;
    message.reply(`Der Hunger des Bots wurde auf ${botHunger}% gesetzt.`);
  }

  if (message.content === `${prefix}feed`) {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 21 || hour < 8) {
      message.reply('Zzzzzzzz...');
      return;
    }

    if (botHunger >= 100) {
      message.reply('Ich bin satt! Sieh dir mein Hungerlvl an! **!hunger**');
      return;
    }
    botHunger += 10;
    if (botHunger > 100) {
      botHunger = 100;
    }

    message.reply(`Nom Nom Danke, Ich bin jetzt zu ${botHunger}% satt und kann weiter Leute nerven! :]`);
  }
});

// Funktion zum Setzen des Hungerlevels und Senden der Nachricht um 8 Uhr morgens
const set_hunger_and_send_message_at_8 = async () => {
  const now = new Date();
  if (now.getHours() === 8 && now.getMinutes() === 0) {
    botHunger = 0;
    const channel1 = client.channels.cache.get('1100112204843450429'); // Hier die ID des Kanals, in dem die Nachricht gesendet werden soll, einf¸gen
    channel1.send('@everyone, Mein bauch knurrt.. Mein Hungerlevel ist bei 0% bitte gib mir was zu essen vielleicht die Kekse dort? **!feed**');
  }
};

// Timer, um die Funktion um 8 Uhr morgens aufzurufen
setInterval(set_hunger_and_send_message_at_8, 60000);


/// TICKET


/// TICKET

client.on('messageCreate', async (message) => {
  if (message.content.startsWith('!ticket create')) {
    const args = message.content.split(' ');
    const reason = args.slice(2).join(' ');

    // ‹berpr¸fen, ob ein Grund angegeben wurde
    if (!reason) {
      message.channel.send('Bitte gib einen Grund fuer das Ticket an!');
      return;
    }

    // Ticket-Kategorie finden
    const ticketCategory = message.guild.channels.cache.find(
      (channel) => channel.type === 'GUILD_CATEGORY' && channel.name === 'Tickets'
    );

    // ‹berpr¸fen, ob die Ticket-Kategorie gefunden wurde
    if (!ticketCategory) {
      message.channel.send('Die Ticket-Kategorie wurde nicht gefunden!');
      return;
    }

    // Ticket-Channel erstellen unter der Ticket-Kategorie
    const channel = await message.guild.channels.create(`${message.author.username}-${reason}`, {
      type: 'GUILD_TEXT',
      parent: ticketCategory.id,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: message.author.id,
          allow: ['VIEW_CHANNEL']
        }
      ]
    });

    // Nachricht im Ticket-Channel senden
    channel.send('Hallo, bitte warte bis ein Teammitglied das Ticket ¸bernimmt und dir weiterhilft, @everyone. `mit !ticket delete kˆnnen Admins das Ticket wieder loeschen!`');

    // Best‰tigungsnachricht im Bot-Channel senden
    message.channel.send(`Das Ticket wurde erfolgreich erstellt! Ticket-Channel: ${channel}`);
  } else if (message.content === '!ticket delete') {
    // ‹berpr¸fen, ob der Benutzer Admin ist
    if (message.member.permissions.has('ADMINISTRATOR')) {
      // Kanal lˆschen
      message.channel.delete();
    } else {
      message.channel.send('Du benˆtigst Administrator-Berechtigungen, um den Kanal zu loeschen!');
    }
  }
});

/// BLOCK COMMANDS!



client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.toLowerCase() === `${prefix}hilfe`) {
    const guild = message.guild;
    const members = guild.members.cache.filter(member => !member.user.bot);
    const onlinePlayers = members.filter(member => member.presence && member.presence.status !== 'offline').size;
    const embed = new Discord.MessageEmbed()
      .setColor('DARK_PURPLE')
      .setDescription(`**Verf√ºgbaren Befehle vom RakBot** \n - **!user: zeigt die Anzahl der Mitglieder auf diesem Server** \n - **!ping** \n - **!info zeigt informationen √ºber den RakBot. ** \n - **!feed F¸ttere mich! ** \n - **!hunger seh dir mein hungerlvl an. ** \n - **!clear Cleare den Chat 0 - 100 ** \n - **!mute/unmute (spieler)** \n - **!warn (spieler) (grund) Warne den Spieler ¸ber DM! **`);

    message.channel.send({ embeds: [embed] });
  }
});


client.on('message', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  if (message.content.toLowerCase() === `${prefix}info`) {
    const guild = message.guild;
    const members = guild.members.cache.filter(member => !member.user.bot);
    const onlinePlayers = members.filter(member => member.presence && member.presence.status !== 'offline').size;
    const embed = new Discord.MessageEmbed()
      .setColor('DARK_PURPLE')
      .setDescription(` **INFORMATIONEN √úBER DEN BOT!** \n - Dieser Bot wurde von Rakun Programmiert. \n - RakBot wurde mit Javascript und Node.js programmiert. \n - Erstellt, 29.Dez.2022`);

    message.channel.send({ embeds: [embed] });
  }
});


/// NEWS ETC


const channelId = ''; // ID des Zielkanals
const command = 'kerowefgjrgegeks'; // Befehl, der erkannt werden soll

client.on('message', (message) => {
  if (message.author.bot) return; // Ignoriere Nachrichten von anderen Bots

  const content = message.content;

  if (content.startsWith(command)) {
    const args = content.slice(command.length).trim().split(/ +/);
    const ip = args[0]; // Die erste Komponente nach dem Befehl ist die IP-Adresse
    const channel = client.channels.cache.get(channelId);

    if (channel) {
      channel.send(`**Freunde** ihr koennt hier nun ein Ticket Erstellen, bitte macht dies nicht wenn ihr nichts wissen wollt bzw ihr solltet das Ticket System **NICHT** ausnutzen dies kann zu einem **Mute** fuehren, **Wie nutze ich jetzt das system?** : Ihr nutzt es in dem ihr **!ticket create (Grund)** macht dieser Grund darf nicht zu lang sein sonst nimmt der Bot es nicht bzw discord weil der Channel name zu lang ist. Ihr werdet im Channel aber auch gepingt @everyone `);
    } else {
      console.log('Kanal nicht gefunden');
    }
  }
});


/// TOKEN

client.login(token);
