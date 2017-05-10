import * as wsrpc from 'wsrpc'
import * as protobuf from 'protobufjs'
import * as zlib from 'zlib'
import * as fs from 'fs'
import * as path from 'path'
import * as sharp from 'sharp'
import {spawn} from 'child_process'
import {PassThrough} from 'stream'
import * as moment from 'moment'
import * as Canvas from 'canvas'

import * as grpc from 'grpc'

import {PaintEvent, StatusEvent, CanvasRequest, CanvasEvent, PaintRequest} from './../protocol/service'
import * as shared from './../shared/paint'

const {env} = process

const styles = [
    {layer: 'autostripe mixed3a_5x5', channel: 9},
    {layer: 'conv2d0_pre_relu', channel: 26},
    {layer: 'conv2d1', channel: 42},
    {layer: 'conv2d1_pre_relu', channel: 4242},
    {layer: 'head0_bottleneck', channel: 6},
    {layer: 'head1_bottleneck_pre_relu', channel: 4242},
    {layer: 'land mixed4d_3x3', channel: 63},
    {layer: 'maxpool1', channel: 4242},
    {layer: 'mixed3a', channel: 120},
    {layer: 'mixed3a', channel: 43},
    {layer: 'mixed3a_3x3', channel: 4242},
    {layer: 'mixed3a_3x3', channel: 77},
    {layer: 'mixed3a_3x3_pre_relu', channel: 4242},
    {layer: 'mixed3a_5x5', channel: 20},
    {layer: 'mixed3a_5x5_bottleneck_pre_relu', channel: 2}, // swirly things, muted colors
    {layer: 'mixed3a_pool_reduce', channel: 13},
    {layer: 'mixed3b', channel: 4242},
    {layer: 'mixed3b_1x1_pre_relu', channel: 65},
    {layer: 'mixed3b_3x3', channel: 144},
    {layer: 'mixed3b_5x5_pre_relu', channel: 10},
    {layer: 'mixed3b_pool', channel: 34},
    {layer: 'mixed4a_3x3_bottleneck_pre_relu', channel: 51},
    {layer: 'mixed4a_pool', channel: 192},
    {layer: 'mixed4a_pool', channel: 280},
    {layer: 'mixed4a_pool_reduce', channel: 4242},
    {layer: 'mixed4a_pool_reduce', channel: 8},
    {layer: 'mixed4b_1x1', channel: 37},
    {layer: 'mixed4b_1x1', channel: 46},
    {layer: 'mixed4b_3x3_bottleneck', channel: 22},
    {layer: 'mixed4b_3x3_bottleneck_pre_relu', channel: 53},
    {layer: 'mixed4b_5x5_bottleneck', channel: 18},
    {layer: 'mixed4b_pool', channel: 4242},
    {layer: 'mixed4c', channel: 126},
    {layer: 'mixed4c_1x1_pre_relu', channel: 4242},
    {layer: 'mixed4c_3x3', channel: 163},
    {layer: 'mixed4c_3x3_bottleneck', channel: 4242},
    {layer: 'mixed4c_5x5_bottleneck', channel: 4242},
    {layer: 'mixed4c_pool_reduce', channel: 61},
    {layer: 'mixed4d_3x3', channel: 4242},
    {layer: 'mixed4d_3x3_bottleneck_pre_relu', channel: 139}, // flowers
    {layer: 'mixed4d_3x3_bottleneck_pre_relu', channel: 139}, // flowers again because nice
    {layer: 'mixed4d_3x3_bottleneck_pre_relu', channel: 4242},
    {layer: 'mixed4d_5x5_bottleneck', channel: 31},
    {layer: 'mixed4d_5x5_bottleneck', channel: 4242},
    {layer: 'mixed4d_5x5_bottleneck_pre_relu', channel: 28},
    {layer: 'mixed4d_pool_reduce_pre_relu', channel: 5},
    {layer: 'mixed4e', channel: 101},
    {layer: 'mixed4e', channel: 255},
    {layer: 'mixed4e', channel: 4242},
    {layer: 'mixed4e', channel: 528},
    {layer: 'mixed4e_3x3_bottleneck_pre_relu', channel: 46},
    {layer: 'mixed4e_3x3_bottleneck_pre_relu', channel: 68},
    {layer: 'mixed4e_5x5_bottleneck', channel: 1},
    {layer: 'mixed4e_5x5_bottleneck', channel: 4242},
    {layer: 'mixed4e_5x5_bottleneck_pre_relu', channel: 27},
    {layer: 'mixed4e_pool_reduce_pre_relu', channel: 120}, // pipe eyes
    {layer: 'mixed4e_pool_reduce_pre_relu', channel: 40}, // blotchy snakes
    {layer: 'mixed4e_pool_reduce_pre_relu', channel: 41}, // blotchy snakes
    {layer: 'mixed5a_3x3', channel: 93},
    {layer: 'mixed5a_3x3_bottleneck_pre_relu', channel: 90},
    {layer: 'mixed5a_5x5_bottleneck_pre_relu', channel: 37},
    {layer: 'mixed5b', channel: 4242},
    {layer: 'mixed5b_1x1_pre_relu', channel: 4242},
    {layer: 'mixed5b_pool_reduce_pre_relu', channel: 100}, // birds and random stuff
    {layer: 'mixed5b_pool_reduce_pre_relu', channel: 140}, // parrot mess
    {layer: 'patterns mixed3a_3x3', channel: 4242},
]

let dreamStyle = env['START_STYLE'] ? styles[parseInt(env['START_STYLE'])] : styles[~~(Math.random() * styles.length)]
const dreamInterval = env['DREAM_INTERVAL'] ? parseInt(env['DREAM_INTERVAL']) : 30 * 1000
const styleInterval = env['STYLE_INTERVAL'] ? parseInt(env['STYLE_INTERVAL']) : 60 * 1000 * 10

console.log(`dream interval ${ dreamInterval }, style change interval ${ styleInterval }`)

const layers = require('./layers.json')
function randomStyle(): {layer: string, channel: number} {
    if (Math.random() > 0.5) {
        const lastIdx = styles.indexOf(dreamStyle)
        let idx: number
        do {
            idx = Math.floor(Math.random() * styles.length)
        } while (idx === lastIdx)
        return styles[idx]
    } else {
        let layer: [string, number]
        do {
            layer = layers[Math.floor(Math.random()*layers.length)]
        } while (dreamStyle.layer === layer[0])
        let channel = 4242
        if (Math.random() > 0.4) {
            channel = Math.floor(Math.random() * layer[1])
        }
        return {layer: layer[0], channel}
    }
}

const dreamProto = grpc.load(path.join(__dirname, '../protocol/dream.proto'))
const dreamClient = new dreamProto.Dreamer('localhost:50051', grpc.credentials.createInsecure(),
    {'grpc.max_send_message_length': 70105240, 'grpc.max_receive_message_length': 70105240})

const proto = protobuf.loadSync(`${ __dirname }/../protocol/service.proto`)

const dreamCanvas = new Canvas(shared.canvasWidth, shared.canvasHeight)
const drawCanvas = new Canvas(shared.canvasWidth, shared.canvasHeight)
const workCanvas = new Canvas(shared.canvasWidth, shared.canvasHeight)

const dreamCtx = dreamCanvas.getContext('2d')
const drawCtx = drawCanvas.getContext('2d')
const workCtx = workCanvas.getContext('2d')

workCtx.patternQuality = dreamCtx.patternQuality = drawCtx.patternQuality = 'fast'
workCtx.filter = dreamCtx.filter = drawCtx.filter = 'fast'
workCtx.antialias = dreamCtx.antialias = drawCtx.antialias = 'none'

try {
    const img = new Canvas.Image()
    img.src = fs.readFileSync('canvas.jpeg')
    dreamCtx.drawImage(img, 0, 0)
} catch (error) {
    if (error.code !== 'ENOENT') {
        throw error
    }
}

async function saveCanvas() {
    const width = shared.canvasWidth
    const height = shared.canvasHeight
    workCtx.drawImage(dreamCanvas, 0, 0)
    workCtx.drawImage(drawCanvas, 0, 0)
    const imageData = workCtx.getImageData(0, 0, width, height)
    const imageBuffer = Buffer.from(imageData.data.buffer)
    await sharp(imageBuffer, {raw: {channels: 4, width, height}})
        .background('#ffffff').flatten()
        .jpeg({quality: 90, chromaSubsampling: '4:4:4'})
        .toFile('canvas.jpeg')
}

process.on('SIGINT', async () => {
    console.log('saving canvas...')
    await saveCanvas()
    console.log('saved')
    process.exit()
})

const server = new wsrpc.Server(proto.lookupService('DreamPainter'), {
    port: 4242
})

async function dreamImage(image: sharp.SharpInstance): Promise<Buffer> {
    const imageBuffer = await image
        .background('#ffffff').flatten()
        .jpeg({quality: 90, chromaSubsampling: '4:4:4'})
        .toBuffer()
    return new Promise<Buffer>((resolve, reject) => {
        const {layer, channel} = dreamStyle
        dreamClient.dream({image: imageBuffer, layer, channel}, (error, result) => {
            if (error) { reject(error) } else {
                resolve(result.image)
                if (process.env['SAVE_DIR']) {
                    const date = moment().format('YYYYMMDD-HHmmss')
                    const filename = path.join(process.env['SAVE_DIR'], `canvas-${ date }.png`)
                    console.log(`saving canvas to ${ filename }`)
                    fs.writeFile(filename, result.image, (error) => {
                        if (error) {
                            console.warn('error saving canvas', error)
                        }
                    })
                }
            }
        })

    })
}

async function dream() {
    const width = shared.canvasWidth
    const height = shared.canvasHeight

    // flush draw buffer
    const timestamp = Date.now()
    dreamCtx.globalAlpha = workCtx.globalAlpha = drawCtx.globalAlpha = 1.0
    dreamCtx.drawImage(drawCanvas, 0, 0)
    drawCtx.clearRect(0, 0, width, height)

    const imageData = dreamCtx.getImageData(0, 0, width, height)
    const imageBuffer = Buffer.from(imageData.data.buffer)
    const image = sharp(imageBuffer, {raw: {channels: 4, width, height}})

    const resultBuffer = await dreamImage(image)
    const result = new Canvas.Image()
    result.src = resultBuffer
    dreamCtx.drawImage(result, 0, 0)

    return timestamp
}

function dreamLoop() {
    dream().then((timestamp) => {
        broadcastCanvas(timestamp)
        const dt = Date.now() - timestamp
        console.log('dream took', dt / 1000)
        if (dt > dreamInterval) {
            console.warn('missed dream interval target', (dt - dreamInterval)/1000)
            setImmediate(dreamLoop)
        } else {
            setTimeout(dreamLoop, dreamInterval - dt)
        }
    }).catch((error) => {
        console.log('dream failed', error.message)
        nextStyle()
        setTimeout(dreamLoop, 500)
    })
}
dreamLoop()

server.implement('paint', async (request: PaintRequest, sender) => {
    shared.paint(request, drawCtx)
    const timestamp = Date.now()
    const {color, pos, size} = request
    const broadcast = PaintEvent.encode({color, pos, size, timestamp}).finish()
    for (const connection of server.connections) {
        if (connection === sender) {
            continue
        }
        connection.send('paint', broadcast)
    }
    return {timestamp}
})

server.implement('getCanvas', async (request: CanvasRequest) => {
    let {offset, width, height} = request
    if (offset.x < 0 || offset.y < 0 ||
        offset.x + width > shared.canvasWidth ||
        offset.y + height > shared.canvasHeight) {
        throw new Error('Out of bounds')
    }
    dreamCtx.globalAlpha = workCtx.globalAlpha = drawCtx.globalAlpha = 1.0
    const timestamp = Date.now()
    workCtx.drawImage(dreamCanvas, 0, 0)
    workCtx.drawImage(drawCanvas, 0, 0)
    const imageData = workCtx.getImageData(offset.x, offset.y, width, height)
    const imageBuffer = Buffer.from(imageData.data.buffer)
    const image = sharp(imageBuffer, {raw: {width, height, channels: 4}})
    const responseImage = await image.background('#ffffff').flatten().jpeg().toBuffer()
    return {image: responseImage, timestamp}
})

const broadcastCanvas = (timestamp: number) => {
    const data = CanvasEvent.encode({timestamp}).finish()
    server.broadcast('canvas', data)
}

const broadcastStatus = () => {
    let {layer, channel} = dreamStyle
    if (channel === 4242) {
        layer += '^2'
    } else {
        layer += `:${ channel }`
    }
    const data = StatusEvent.encode({
        users: server.connections.length, layer
    }).finish()
    server.broadcast('status', data)
}

server.on('connection', (connection) => {
    broadcastStatus()
    connection.once('close', broadcastStatus)
})

server.on('error', (error) => {
    console.log('error', error.message)
})

server.on('listening', () => {
    console.log(`listening on ${ server.options.port }, pid ${ process.pid }`)
})

let styleTimer: NodeJS.Timer
function nextStyle() {
    clearTimeout(styleTimer)
    dreamStyle = randomStyle()
    console.log('new style', dreamStyle)
    broadcastStatus()
    styleTimer = setTimeout(nextStyle, styleInterval)
}

process.on('SIGHUP', nextStyle)
nextStyle()
