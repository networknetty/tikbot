
const { Telegraf } = require("telegraf")
const axios = require("axios")
const fs = require("fs")

const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply('hello!'))

const apis = ['https://saveig.app', 'https://snapinsta.app', 'https://igram.io']
async function tryInstApi(ctx, message) {
  const _apis = [...apis],
    eArr = []
  while (_apis.length) {
    try {
      const api = _apis.shift()
      const res = await axios.get(`${api}/api?url=${message}`)
      for (const media of res.data.media) {
        media.type === "video" ?
          await ctx.replyWithVideo({ url: media.url }) :
          await ctx.replyWithPhoto({ url: media.url })
      }
      return
    }
    catch(err){
      eArr.push(err)
    }
  }
  return Promise.reject(eArr)
}

bot.on("text", async (ctx) => {
  const message = ctx.message.text
  if (message.includes("tiktok.com")) {
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${message}`
      const response = await axios.get(apiUrl)
      const videoUrl = response.data?.data?.play
      if (videoUrl) {
        const videoPath = "tiktok_video.mp4"
        const videoStream = fs.createWriteStream(videoPath)
        const videoResponse = await axios({
          url: videoUrl,
          method: "GET",
          responseType: "stream",
        })
        videoResponse.data.pipe(videoStream)
        videoStream.on("finish", async () => {
          await ctx.replyWithVideo({ source: videoPath })
          fs.unlinkSync(videoPath) // Удаляем видео после отправки
        })
      } else {
        console.error("fail videoUrl")
        ctx.reply(`❌`)
      }
    } catch (error) {
      console.error(error)
      ctx.reply(`❌ ${error}`)
    }
  }
  else if (message.includes("instagram.com")) {
    try {
      await tryInstApi(ctx, message)
    }
    catch (error) {
      // ctx.reply(`❌ ${error}`)
      console.error(`❌ ${error}`)
    }
  }
  else {
    // ctx.reply("without TikTok / Instagram!")
  }
})

bot.launch()

const express = require("express")
const app = express()
const PORT = process.env.PORT || 3000

app.get("/", (req, res) =>
  res.send("express get/"))

app.use(express.json())
app.use(bot.webhookCallback('/bot'))

// bot.setWebhook(`${process.env.boturl}/bot`)

app.listen(PORT, () => console.log(`start express port: ${PORT}`))
