import {Guild, Message, MessageManager, Snowflake, User} from "discord.js";

export const fetchHumanMessages = async (messageManager: MessageManager, count: number) => {
    let messages: Message[] = [];
    
    // populate array
    let lastId: Snowflake | undefined;
    while (messages.length < count) {
        let fetched = await messageManager.fetch({
            limit: 25,
            before: lastId
        });
        fetched = fetched.filter(msg => !msg.author.bot);
        const fetchedArr = fetched.map(v => v);
        messages.push(...fetchedArr);
        lastId = fetchedArr.pop()?.id
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