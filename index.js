const { VK } = require('vk-io');

const User = require('./user');
const mathJs = require('mathjs');

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

    ctx.user = await buildUser(ctx.senderId);

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
        const { firstName, lastName } = ctx.user;

        const [ , string ] = ctx.args;

        await ctx.send(
            `${ firstName } ${ lastName } попробовал ${ string } | ${ getRandomInt(0, 1) ? 'Успешно' : 'Fail' }`
        );

        return;
    }
});

command({
    pattern: /^\/сколько\s(.*)/i,
    description: '/сколько [ваше уравнение] -- получаем ответ',
    async handler(ctx) {
        const result = mathJs.eval(ctx.args[1]);

        await ctx.send(
            `${ ctx.args[1] } = ${ result }`
        );

        return;
    }
});

command({
    pattern: /^\/(кончил|sperm)/i,
    description: '/кончил [пикча] [алиасы: /sperm] -- украшает вашу пикчу',
    async handler(ctx) {
        if (!ctx.hasAttachments('photo')) {
            await ctx.send('Вы не прикрепили изображение.');

            return;
        }

        const [ { largePhoto } ] = ctx.getAttachments('photo');

        try {
            await ctx.sendPhotos(
                `http://www.lunach.ru/?cum=&url=${ largePhoto }`
            );
        } catch (e) {
            console.log(e);

            await ctx.send('Я не смог загрузить обработанное изображние :C');
        }

        return;
    }
});

command({
    pattern: /^\/restyle ([^]+)/i,
    description: '/restyle [ТЕКСТ] -- украшает ваш текст',
    async handler(ctx) {
        const [ , text ] = ctx.args;

        await ctx.send(
            text.split('')
                .map(e => e.toUpperCase())
                .join(' ')
        );

        return;
    }
});

command({
    pattern: /^\/password/,
    description: '/password -- генерация пароля',
    async handler(ctx) {
        const password = (Math.random()).toString(36).slice(2);

        await ctx.send(
            `Your password: ${ password }`
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

async function buildUser(vkId) {
    let user = await User.findOne({
        where: {
            vkId
        }
    });

    if (!user) {
        const [ 
            { 
                first_name: firstName, 
                last_name: lastName
            } 
        ] = await vk.api.users.get({
            user_ids: ctx.senderId
        })

        user = await User.create({
            vkId,
            firstName,
            lastName
        });
    }

    return user;
}

/**
 * В идеале разбить это на модули и дальше там шароебится, но я сохраняю структуру того самого VKBOT V1 2017 GOLD EDITION
 */
