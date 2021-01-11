import {Mutex} from 'async-mutex';
import ytdl from 'ytdl-core';
import audios from './audios.js';
import path from 'path';

const __dirname = path.resolve(path.dirname(''));

export default class CommandHandler {
    prefix = ".";
    connection;

    mutex = new Mutex();

    constructor(client){
        client.on("message", this.handler.bind(this));
    }

    async add(message) {
        const chanel = message.member.voice.channel;
        if(!chanel) {
            message.reply('Entra num canal antes, ANIMAL!');
            return;
        }
        const release = await this.mutex.acquire();
        try {
            this.connection = await chanel.join();
        } finally {
            release();
        }
    }

    async remove(message) {
        const chanel = message.member.voice.channel;
        const release = await this.mutex.acquire();
        try {
            this.connection.disconnect();
        } finally {
            release();
        }
    }

    ping(message) {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Latência: ${timeTaken}ms`);
    }

    play(args) {
        if(args.length == 1) {
            const dispatcher = this.connection.play(ytdl(args[0], { filter: 'audioonly' }));
        } else if(args.length > 1) {
            const dispatcher = this.connection.play(ytdl('https://www.youtube.com/results?search_query=' + args.join('+'), { filter: 'audioonly' }));
            console.log('https://www.youtube.com/results?search_query=' + args.join('+'));
        }
    }

    async handler(message) { 
        try {
            if(message.author.bot) return;
            if(!message.content.startsWith(this.prefix)) return;
            const commandBody = message.content.slice(this.prefix.length);
            const args = commandBody.split(' ');
            const command = args.shift().toLowerCase();
            if(command === "ping") {
                this.ping(message);
            } else if(command === "entra") {
                await this.add(message);
            } else if(command === "sai") {
                this.remove(message);
            } else if(command === "toca") {
                if(args != null && args != undefined)
                    this.add(message);
                    this.play(args);
            } else {
                this.add(message);
                const dispatcher = this.connection.play(__dirname + audios[command]);
            }
        } catch(e) {
            console.log(e.message);
        }
    }
}