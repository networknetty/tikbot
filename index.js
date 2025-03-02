require("dotenv").config();
const { Telegraf } = require("telegraf");
const axios = require("axios");
const fs = require("fs");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
    ctx.reply("waiting for TikTok");
});

bot.on("text", async (ctx) => {
    const message = ctx.message.text;
    const tiktokUrlRegex = /(https?:\/\/www\.tiktok\.com\/[^\s]+)/;

    if (tiktokUrlRegex.test(message)) {
        ctx.reply("loading...");
        
        try {
            const apiUrl = `https://www.tikwm.com/api/?url=${message}`;
            const response = await axios.get(apiUrl);
            const videoUrl = response.data?.data?.play;

            if (videoUrl) {
                const videoPath = "tiktok_video.mp4";
                const videoStream = fs.createWriteStream(videoPath);

                const videoResponse = await axios({
                    url: videoUrl,
                    method: "GET",
                    responseType: "stream",
                });

                videoResponse.data.pipe(videoStream);

                videoStream.on("finish", async () => {
                    await ctx.replyWithVideo({ source: videoPath });
                    fs.unlinkSync(videoPath); // Удаляем видео после отправки
                });
            } else {
                ctx.reply("fail");
            }
        } catch (error) {
            console.error(error);
            ctx.reply("fail... try later");
        }
    } else {
        ctx.reply("error link TikTok!");
    }
});

bot.launch();
console.log("serve...");
