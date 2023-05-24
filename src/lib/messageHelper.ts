import {Guild, Message, MessageManager, Snowflake, User} from "discord.js";

export const fetchHumanMessages = async (messageManager: MessageManager, count: number) => {
    const initial = await messageManager.fetch({
        limit: 25
    });
    let messages = initial.filter(msg => !msg.author.bot).map(v => v);

    // populate array
    let lastId: string = messages[messages.length - 1] ? messages[messages.length - 1].id : "";
    while (messages.length < count) {
        let fetched = await messageManager.fetch({
            limit: 25,
            before: lastId.length > 0 ? lastId : undefined
        });
        lastId = fetched.map(v => v).pop()?.id || "";
        fetched = fetched.filter(msg => !msg.author.bot);
        const fetchedArr = fetched.map(v => v);
        messages.push(...fetchedArr);
    }
    
    // reduce to correct count
    messages = messages.slice(0, count);
    
    // sort by time
    messages = messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
    
    return messages;
}

export const getName = async (user: User, guild: Guild) => {
    const resolvedUser = await guild.members.resolve(user);
    if (!resolvedUser) {
        // remove the discriminator
        const i = user.tag.indexOf("#");
        return user.tag.substring(0, i);
    } else {
        // use display name
        return resolvedUser.displayName
    }
}