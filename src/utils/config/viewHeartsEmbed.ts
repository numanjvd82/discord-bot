import { MessageEmbed } from "discord.js";
import { ServerModelInt } from "../../database/models/ServerModel";

export const viewHeartsEmbed = (
  config: ServerModelInt,
  page: number
): MessageEmbed => {
  const start = (page - 1) * 10;
  const end = page * 10;
  const heartsEmbed = new MessageEmbed()
    .setTitle("Hearts")
    .setFooter("These users will receive my love!")
    .setDescription(
      config.hearts
        .map((el, i) => `#${++i}. <@!${el}> - ID: ${el}`)
        .slice(start, end)
        .join("\n") || "No one :("
    )
    .setFooter(`Page ${page} of ${Math.ceil(config.hearts.length / 10)}`);

  return heartsEmbed;
};
