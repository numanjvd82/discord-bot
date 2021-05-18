import { MessageEmbed } from "discord.js";
import { ServerModelInt } from "../../database/models/ServerModel";

export const viewBlockedEmbed = (
  config: ServerModelInt,
  page: number
): MessageEmbed => {
  const start = (page - 1) * 10;
  const end = page * 10;
  const blockedEmbed = new MessageEmbed()
    .setTitle("Blocked")
    .setFooter("These users will not receive my assistance.")
    .setDescription(
      config.blocked
        .map((el, i) => `#${++i}. <@!${el}> - ID: ${el}`)
        .slice(start, end)
        .join("\n") || "No one :)"
    )
    .setFooter(`Page ${page} of ${Math.ceil(config.blocked.length / 10)}`);
  return blockedEmbed;
};
