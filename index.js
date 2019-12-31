const { VK } = require('vk-io');

const vk = new VK({
    token: 'YOUR_TOKEN',
    apiMode: 'parallel_selected',
    apiLimit: 20
});

const commands = [];

vk.updates.on(['new_message'], async ctx => {
    if (!ctx.text) {
        return;
    }

    log(`[MESSAGE] @id${ctx.senderId}/${ctx.chatId || 0}: ${ctx.text.slice(0, 42)}`);

    const command = findCommand(ctx.text);

    if (!command) {
        return;
    }

    ctx.args = ctx.text.match(command.pattern) || [];

    try {
        await command.handler(ctx);
    } catch (e) {
        console.log(e);
    }
});

vk.updates.start();

command({
    pattern: /^\/(гбг|генбугурт|\@)/i,
    description: '/гбг [fwd] -- генерация бугурта',
    async handler(ctx) {
        const { forwards } = ctx;

        if (forwards.length === 0) {
            await ctx.send('Дебил, цитатни сообщения');

            return;
        }

        await ctx.send(
            forwards
                .map(e => e.text.toUpperCase())
                .join('\n@\n')
        );

        return;
    }
});

command({
    pattern: /^\/2ch/i,
    description: '/2ch [fwd_msg] -- генерация стрелочек >',
    async handler(ctx) {
        const { forwards } = ctx;

        if (forwards.length === 0) {
            await ctx.send('Дебил, цитатни сообщения');

            return;
        }

        await ctx.send(
            `> ${ forwards.map(e => e.text).join('\n>') }`
        );

        return;
    }
});

command({
    pattern: /^\/(шар|8ball|вопрос)/i,
    description: '/шар вопрос -- отвечает Да или Нет',
    async handler(ctx) {
        const answers = [
            'Мой ответ -- да.',
            'Мой ответ -- нет.',
            'Я не могу сейчас дать ответ на этот вопрос.',
            'Возможно, но это не точно.'
        ];

        await ctx.send(
            answers[getRandomInt(0, answers.length - 1)]  
        );

        return;
    }
});

command({
    pattern: /^\/инфа/i,
    description: '/инфа [текст] -- предсказывает вероятность',
    async handler(ctx) {
        await ctx.send(
            `Вероятность -- ${ getRandomInt(0, 100) }%`
        );

        return;
    }
});

command({
    pattern: /^\/(cmd|п[о]+м[о]+щь|h[e]+lp)/i,
    description: '/помощь [алиасы: /cmd, /help] -- вывод всех команд',
    async handler(ctx) {
        await ctx.send(
            commands
                .filter(e => !e.admin)
                .map(e => `\n✏ ${ e.description }`)
                .join('')
        );

        return;
    }
});

command({
    pattern: /^\/try\s(.*)/i,
    description: '/try [текст] -- попытка',
    async handler(ctx) {
        // TODO: сохранять Ф.И в БД и использовать здесь

        const [ { first_name, last_name } ] = await vk.api.users.get({
            user_ids: ctx.senderId
        });

        const [ , string ] = ctx.args;

        await ctx.send(
            `${ first_name } ${ last_name } попробовал ${ string } | ${ getRandomInt(0, 1) ? 'Успешно' : 'Fail' }`
        );

        return;
    }
});

function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function findCommand(text) {
    for (const command of commands) {
        if (command.pattern.test(text)) {
            return command;
        }
    }

    return null;
}

function command(options) {
    commands.push(options);
}

function log(text) {
    console.log(text);
}

/**
 * В идеале разбить это на модули и дальше там шароебится, но я сохраняю структуру того самого VKBOT V1 2017 GOLD EDITION
 */
