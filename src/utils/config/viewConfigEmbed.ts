/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { MessageEmbed } from "discord.js";
import { ServerModelInt } from "../../database/models/ServerModel";
import MessageInt from "../../interfaces/MessageInt";

export const viewConfigEmbed = (
  message: MessageInt,
  config: ServerModelInt
): MessageEmbed => {
  const { Becca, guild } = message;
  const { prefix } = Becca;

  // Create a new empty embed.
  const configEmbed = new MessageEmbed();

  // Add the title.
  configEmbed.setTitle("Here is my record for your server.");

  // Add the logs channel to an embed field.
  configEmbed.addField(
    "Log channel",
    config.log_channel
      ? `Moderation activity, such as kicks, bans, warnings, and deleted messages will go to the <#${config.log_channel}> channel.`
      : `Please configure a logs channel using \`${
          prefix[guild!.id]
        }config set log_channel #channel)\`.`
  );

  // Add the welcomes channel to an embed field.
  configEmbed.addField(
    "Welcome Channel",
    config.welcome_channel
      ? `Members will be welcomed (and member departures will be mentioned) in the <#${config.welcome_channel}> channel.`
      : `Please configure a welcomes channel using \`${
          prefix[guild!.id]
        }config set welcome_channel #channel)\`.`
  );

  // Add the suggestion channel to an embed field.
  configEmbed.addField(
    "Suggestion Channel",
    config.suggestion_channel
      ? `I will allow users to send suggestions to the <#${
          config.suggestion_channel
        }> channel using my \`${prefix[guild!.id]}suggest\` command.`
      : `I will not accept suggestions from your server members.`
  );

  // Add the restricted role to an embed field.
  configEmbed.addField(
    "Restricted Role",
    config.restricted_role
      ? `The restrict and unrestrict role for the server is <@&${config.restricted_role}>`
      : `Please configure a restrict role using \`${
          prefix[guild!.id]
        }config set restricted_role @role\`.`
  );

  // Add the moderator role to an embed field.
  configEmbed.addField(
    "Moderator Role",
    config.moderator_role
      ? `The moderator role for the restrict command is <@&${config.moderator_role}>`
      : `Please configure a moderator role using \`${
          prefix[guild!.id]
        }config set moderator_role @role\`.`
  );

  // Add the thanks setting to an embed field.
  configEmbed.addField(
    "Thanks",
    `I will${
      config.thanks === "on" ? "" : " NOT"
    } congratulate users when another user thanks them.`
  );

  // Add the levels setting to an embed field.
  configEmbed.addField(
    "Levels",
    `I will${
      config.levels === "on" ? "" : " NOT"
    } give users experience points for being active.`
  );

  // Add welcome message status to embed
  configEmbed.addField(
    "Welcome Message",
    config.custom_welcome
      ? config.custom_welcome
      : "Hello `{@username}`! Welcome to `{@servername}`! My name is Becca, and I am here to help!"
  );

  configEmbed.addField(
    "Additional settings",
    "View your `hearts`, `self_roles`, and `blocked` settings with `config view <setting>`."
  );

  return configEmbed;
};
