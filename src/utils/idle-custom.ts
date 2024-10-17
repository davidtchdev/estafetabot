import { addKeyword, EVENTS } from '@builderbot/bot'
import { BotContext, TFlow } from '@builderbot/bot/dist/types'

const timers = {}
const IDLETIME = 300000

function formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}` +
        ` ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}


// Flow for handling inactivity
const idleFlow = addKeyword(EVENTS.ACTION).addAction(
    async (_, { endFlow }) => {
        return endFlow(`Te han desconectado del BOT después de ${IDLETIME / 1000} segundos de inactividad`)
    }
)

// Function to start the inactivity timer for a user
const start = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number) => {
    const nowDate: Date = new Date()
    console.log(`Temporizador para el usuario ${ctx.from} - Empezó a las:   ${formatDate(nowDate)}`)
    timers[ctx.from] = setTimeout(() => {
        const nowDate: Date = new Date()
        console.log(`Temporizador para el usuario ${ctx.from} - Terminó en:     ${formatDate(nowDate)}`)
        return console.log("ok");
    }, ms)
}

// Function to reset the inactivity timer for a user
const reset = (ctx: BotContext, gotoFlow: (a: TFlow) => Promise<void>, ms: number) => {
    stop(ctx)
    if (timers[ctx.from]) {
        const nowDate: Date = new Date()
        console.log(`Timer for user ${ctx.from} - Restarted at: ${formatDate(nowDate)}`)
        clearTimeout(timers[ctx.from])
    }
    start(ctx, gotoFlow, ms)
}

// Function to stop the inactivity timer for a user
const stop = (ctx: BotContext) => {
    const nowDate: Date = new Date()
    //console.log(`Timer for user ${ctx.from} - Stopped at:   ${formatDate(nowDate)}`)
    if (timers[ctx.from]) {
        clearTimeout(timers[ctx.from])
    }
}

export {
    start,
    reset,
    stop,
    idleFlow,
    IDLETIME
}