
import * as Raven from 'raven-js'
if (global['__raven_url']) {
    Raven.config(global['__raven_url'], {
        release: global['__release']
    }).install()
}

window['Promise'] = require('es6-promise-polyfill').Promise

import {Client} from 'wsrpc'
import * as proto from './../../../protocol/service'
import * as shared from './../../../shared/paint'
import Dialog from './dialog'
import * as Cookie from 'js-cookie'

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const serverUrl = global['__server_url'] || 'ws://localhost:8080'

interface DrawPosition {
    x: number
    y: number
    timestamp: number
}

interface DrawEvent {
    pos: DrawPosition
    lastPos?: DrawPosition
    lastV?: number
    force?: number
    color: number
}

const palettes = [
    //[0x000000, 0xffffff, -1, 0xff0000, 0xff8000, 0xffff00, 0x00ff00, 0x0080ff, 0x0000ff, 0x8000ff, 0xff00ff],
    [0x000000, 0xffffff, -1, 0x00A8C6, 0x40C0CB, 0xF9F2E7, 0xAEE239, 0x8FBE00],
    [0x000000, 0xffffff, -1, 0x467588, 0xFCE5BC, 0xFDCD92, 0xFCAC96, 0xDD8193],
    [0x000000, 0xffffff, -1, 0xF8B195, 0xF67280, 0xC06C84, 0x6C5B7B, 0x355C7D],
    [0x000000, 0xffffff, -1, 0xCFF09E, 0xA8DBA8, 0x79BD9A, 0x3B8686, 0x0B486B],
    [0x000000, 0xffffff, -1, 0xEEE6AB, 0xC5BC8E, 0x696758, 0x45484B, 0x36393B],
    [0x000000, 0xffffff, -1, 0xFFED90, 0xA8D46F, 0x359668, 0x3C3251, 0x341139],
    [0x000000, 0xffffff, -1, 0x351330, 0x424254, 0x64908A, 0xE8CAA4, 0xCC2A41],
    [0x000000, 0xffffff, -1, 0xD9CEB2, 0x948C75, 0xD5DED9, 0x7A6A53, 0x99B2B7],
    [0x000000, 0xffffff, -1, 0x00A0B0, 0x6A4A3C, 0xCC333F, 0xEB6841, 0xEDC951],
    [0x000000, 0xffffff, -1, 0xFF4E50, 0xFC913A, 0xF9D423, 0xEDE574, 0xE1F5C4],
    [0x000000, 0xffffff, -1, 0xE94E77, 0xD68189, 0xC6A49A, 0xC6E5D9, 0xF4EAD5],
    [0x000000, 0xffffff, -1, 0xE8DDCB, 0xCDB380, 0x036564, 0x033649, 0x031634],
    [0x000000, 0xffffff, -1, 0x69D2E7, 0xA7DBD8, 0xE0E4CC, 0xF38630, 0xFA6900],
    [0x000000, 0xffffff, -1, 0x490A3D, 0xBD1550, 0xE97F02, 0xF8CA00, 0x8A9B0F],
    [0x000000, 0xffffff, -1, 0x8C2318, 0x5E8C6A, 0x88A65E, 0xBFB35A, 0xF2C45A],
    [0x000000, 0xffffff, -1, 0xEFFFCD, 0xDCE9BE, 0x555152, 0x2E2633, 0x99173C],
    [0x000000, 0xffffff, -1, 0x607848, 0x789048, 0xC0D860, 0xF0F0D8, 0x604848],
    [0x000000, 0xffffff, -1, 0x556270, 0x4ECDC4, 0xC7F464, 0xFF6B6B, 0xC44D58],
]

function toHex(d: number): string {
  let hex = Number(d).toString(16)
  hex = '000000'.substr(0, 6 - hex.length) + hex
  return '#'+hex
}

const now = window.performance ? () => window.performance.now() : () => Date.now()
const day = () => Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 2))

const client = new Client(serverUrl, proto.DreamPainter, {
    sendTimeout: 5 * 60 * 1000,
    eventTypes: {
        paint: proto.PaintEvent,
        status: proto.StatusEvent,
        canvas: proto.CanvasEvent,
    }
})

client.on('open', () => {
    document.documentElement.classList.add('connected')
})

client.on('close', () => {
    document.documentElement.classList.remove('connected')
})

export default async function main() {
    if (!Cookie.get('experienced-painter')) {
        const dialog = new Dialog(window)
        let html = `<p>
            This is a collaborative space, be respectful and patient with the
            Artificial Intelligence and the other Humans drawing.
        </p>`
        if (isMobile) {
            html += `<p>
                Select colors by tapping them in the palette to the left.
                To move around hold the cross in the corner with one finger and drag the canvas with another.
            </p>`
        } else {
            html += `<p>
                Select colors by clicking them in the lower left corner.
                Pan around by holding spacebar and dragging the canvas.
            </p>`
        }
        dialog.show({
            title: 'Welcome to DreamCanvas!', html, button: 'Okay'
        }).then(() => {
            Cookie.set('experienced-painter', 'yep', {expires: 365})
        })
    }

    const status = document.createElement('div')
    status.className = 'status'
    status.innerHTML = 'Connecting...'
    document.body.appendChild(status)

    client.on('event status', (event: proto.StatusEvent) => {
        status.innerHTML = `users <span>${ event.users }</span> target <span>${ event.layer }</span>`
    })

    client.on('close', () => {
        status.innerHTML = 'Disconnected'
    })

    client.on('error', (error) => {
        console.warn('client error', error)
    })

    const colors = palettes[Math.floor(Math.random() * palettes.length)]
    console.log('palette', palettes.indexOf(colors))

    let activeColor: number = colors[0]

    const colorWells: HTMLSpanElement[] = []
    const colorPicker = document.createElement('div')
    colorPicker.className = 'picker'
    for (const color of colors) {
        const well = document.createElement('span')
        if (color === -1) {
            well.classList.add('magic')
        } else {
            const cssColor = toHex(color)
            well.style.backgroundColor = cssColor
            well.style.outlineColor = cssColor
        }
        well.addEventListener('click', (event) => {
            event.preventDefault()
            colorWells.forEach((el) => el.classList.remove('active'))
            well.classList.add('active')
            activeColor = color
        })
        colorWells.push(well)
        colorPicker.appendChild(well)
    }
    document.body.appendChild(colorPicker)

    colorWells[0].classList.add('active')

    const canvas = document.querySelector('canvas')
    const ctx = canvas.getContext('2d')

    // const pixelRatio = (window.devicePixelRatio || 1) * 0.75
    const pixelRatio = 1.0

    canvas.width = window.innerWidth * pixelRatio
    canvas.height = window.innerHeight * pixelRatio

    let offset = {
        x: Math.max(0, (shared.canvasWidth / 2) - (canvas.width / 2)),
        y: Math.max(0, (shared.canvasHeight / 2) - (canvas.height / 2)),
    }

    let isFetching: boolean = false
    let drawBuffer: proto.IPaintEvent[] = []
    function emptyDrawBuffer(timestamp: number) {
        while (drawBuffer.length > 0) {
            const event = drawBuffer.shift()
            if (event.timestamp > timestamp) {
                offsetPaint(event)
            }
        }
    }

    function offsetPaint(event: proto.IPaintRequest) {
        const {pos, color, size} = event
        shared.paint({
            pos: {
                x: pos.x - offset.x,
                y: pos.y - offset.y,
            }, color, size
        }, ctx)
    }
    client.on('event paint', (event: proto.PaintEvent) => {
        if (event.timestamp >= canvasTimestamp) {
            drawBuffer.push(event)
            offsetPaint(event)
        }
    })

    const panHandle = document.createElement('div')
    panHandle.className = 'pan-handle'
    panHandle.innerHTML = '☩'
    document.body.appendChild(panHandle)

    const panInfo = document.createElement('div')
    panInfo.className = 'info pan'
    panInfo.innerHTML = 'Drag to move'
    document.body.appendChild(panInfo)

    let isPanning = false
    const enterPan = () => {
        isPanning = true
        document.documentElement.classList.add('pan')
        window.addEventListener('mousedown', startMousePan)
    }

    const exitPan = () => {
        isPanning = false
        document.documentElement.classList.remove('pan')
        window.removeEventListener('mousedown', startMousePan)
    }

    let panStartPos: {x: number, y: number}
    let panStartOffset: {x: number, y: number}
    let panData: ImageData

    const panStart = (pos: {x: number, y: number}) => {
        document.documentElement.classList.add('pan-move')
        panStartPos = {x: pos.x, y: pos.y}
        panStartOffset = {x: offset.x, y: offset.y}
        panData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    }

    const panMove = (pos: {x: number, y: number}) => {
        const dx = pos.x - panStartPos.x
        const dy = pos.y - panStartPos.y

        offset.x = panStartOffset.x - dx
        offset.y = panStartOffset.y - dy

        if (offset.x < 0 || offset.y < 0 ||
            offset.x > shared.canvasWidth - canvas.width ||
            offset.y > shared.canvasHeight - canvas.height)
        {
            ctx.fillStyle = '#ffd4c6'
        } else {
            ctx.fillStyle = '#e9e9e9'
        }

        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.putImageData(panData, Math.floor(dx), Math.floor(dy))
    }

    const panEnd = () => {
        offset.x = Math.max(0, Math.min(offset.x, shared.canvasWidth - canvas.width))
        offset.y = Math.max(0, Math.min(offset.y, shared.canvasHeight - canvas.height))
        if (offset.x !== panStartOffset.x || offset.y !== panStartOffset.y) {
            fetchCanvas()
        } else {
            ctx.putImageData(panData, 0, 0)
        }
        document.documentElement.classList.remove('pan-move')
        panData = null
    }

    const startMousePan = (event: MouseEvent) => {
        event.preventDefault()
        panStart(event)
        const moveHandler = (event: MouseEvent) => {
            panMove(event)
        }
        const endHandler = (event: MouseEvent) => {
            event.preventDefault()
            window.removeEventListener('mousemove', moveHandler)
            window.removeEventListener('mouseup', endHandler)
            window.removeEventListener('mouseleave', endHandler)
            panEnd()
        }
        window.addEventListener('mousemove', moveHandler)
        window.addEventListener('mouseup', endHandler)
        window.addEventListener('mouseleave', endHandler)
    }

    window.addEventListener('keydown', (event) => {
        if (event.keyCode === 32) {
            event.preventDefault()
            if (!isPanning) { enterPan() }
        }
    })

    window.addEventListener('keyup', (event) => {
        if (event.keyCode === 32) {
            event.preventDefault()
            exitPan()
        }
    })

    panHandle.addEventListener('touchstart', (event) => {
        event.preventDefault()
        enterPan()
    })

    panHandle.addEventListener('touchcancel', (event) => {
        exitPan()
    })

    panHandle.addEventListener('touchend', (event) => {
        exitPan()
    })

    panHandle.addEventListener('mousedown', (event) => {
        event.preventDefault()
        startMousePan(event)
    })

    const loadingEl = document.createElement('div')
    loadingEl.className = 'info loading'
    loadingEl.innerHTML = 'Loading canvas...'
    document.body.appendChild(loadingEl)

    let canvasTimestamp: number

    async function fetchCanvas() {
        isFetching = true
        document.documentElement.classList.add('loading')

        offset.x = Math.max(0, Math.min(offset.x, shared.canvasWidth - canvas.width))
        offset.y = Math.max(0, Math.min(offset.y, shared.canvasHeight - canvas.height))

        const request: proto.ICanvasRequest = {
            offset,
            width: Math.min(window.innerWidth * pixelRatio, shared.canvasWidth - offset.x),
            height: Math.min(window.innerHeight * pixelRatio, shared.canvasHeight - offset.y),
        }
        console.log('loading canvas...', request)
        const response = await client.service.getCanvas(request)

        console.log(`response size: ${ ~~(response.image.length / 1024) }kb`)

        const arr = response.image
        let buffer = Buffer.from(arr.buffer)
        buffer = buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)

        await new Promise((resolve, reject) => {
            const img = new Image()
            img.src = `data:image/jpeg;base64,` + buffer.toString('base64')
            img.onload = () => {
                ctx.globalAlpha = 1.0
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 0, 0)
                resolve()
            }
            img.onerror = (error) => {
                reject(error)
            }
        })

        document.documentElement.classList.remove('loading')
        isFetching = false
        emptyDrawBuffer(response.timestamp)
        canvasTimestamp = response.timestamp
    }


    client.on('event canvas', (event) => {
        fetchCanvas().catch((error) => {
            console.warn('error fetching canvas', error)
        })
    })

    let debounceTimer
    window.addEventListener('resize', () => {
        if (window.innerWidth * pixelRatio <= canvas.width &&
            window.innerHeight * pixelRatio <= canvas.height) {
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
            canvas.width = window.innerWidth * pixelRatio
            canvas.height = window.innerHeight * pixelRatio
            ctx.putImageData(data, 0, 0)
        } else {
            canvas.width = window.innerWidth * pixelRatio
            canvas.height = window.innerHeight * pixelRatio
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(fetchCanvas, 500)
            document.documentElement.classList.add('loading')
        }
    })

    await fetchCanvas()
    document.documentElement.classList.add('has-canvas')

    client.on('open', fetchCanvas)

    let forceChanged = false
    let forceLast: number|undefined

    const vF = 0.5
    const vMax = 8
    async function drawAsync(event: DrawEvent) {
        let msgs: proto.IPaintRequest[] = []
        let size = 11// * pixelRatio
        const color = event.color
        if (!forceChanged && event.force) {
            if (forceLast !== undefined) {
                forceChanged = event.force !== forceLast
            }
            forceLast = event.force
        }
        let hasForce = event.force && forceChanged
        if (hasForce) {
            size = Math.min(size + event.force * shared.brushSize, shared.brushSize)
        }
        if (event.lastPos) {
            const dx = event.lastPos.x - event.pos.x
            const dy = event.lastPos.y - event.pos.y
            const d = Math.sqrt(dx*dx + dy*dy)
            if (!hasForce && event.pos.timestamp !== event.lastPos.timestamp) {
                const dt = event.pos.timestamp - event.lastPos.timestamp
                let v = Math.min(d / dt, vMax)
                if (event.lastV) {
                    v = event.lastV * (1 - vF) + v * vF
                }
                if (v < 0) { v = 0 }
                event.lastV = v
                size = Math.min(size + size * v, shared.brushSize)
            }
            const interpSteps = ~~(d / (size / 4))
            for (let i = 0; i < interpSteps; i++) {
                const p = (i + 1) / (interpSteps + 1)
                const x = event.lastPos.x * p + event.pos.x * (1 - p)
                const y = event.lastPos.y * p + event.pos.y * (1 - p)
                msgs.push({pos: {x: x + offset.x, y: y + offset.y}, color, size})
            }
        }
        msgs.push({
            pos: {
                x: event.pos.x + offset.x,
                y: event.pos.y + offset.y,
            },
            color, size
        })
        const wasFetching = isFetching
        let drawCalls: Promise<proto.IPaintResponse>[] = []
        for (const msg of msgs) {
            offsetPaint(msg)
            drawCalls.push(client.service.paint(msg))
        }
        const results = await Promise.all(drawCalls)

        for (let i = 0; i < results.length; i++) {
            const {pos, color, size} = msgs[i]
            drawBuffer.push({pos, color, size, timestamp: results[i].timestamp})
        }
        if (wasFetching && wasFetching !== isFetching) {
            emptyDrawBuffer(canvasTimestamp)
        }

    }

    function draw(event: DrawEvent) {
        drawAsync(event).catch((error) => {
            console.warn('error drawing', error)
        })
    }

    let mouseDraw: DrawEvent|undefined

    function pickColor(x, y): number {
        const {data} = ctx.getImageData(x, y, 1, 1)
        return ((data[0]&0x0ff)<<16)|((data[1]&0x0ff)<<8)|(data[2]&0x0ff)
    }

    canvas.addEventListener('mousedown', (event) => {
        event.preventDefault()
        if (isPanning) { return }
        const x = event.x * pixelRatio
        const y = event.y * pixelRatio
        const color = activeColor === -1 ? pickColor(x, y) : activeColor
        mouseDraw = {
            pos: {x, y, timestamp: event.timeStamp || now()}, color
        }
        draw(mouseDraw)
    })

    canvas.addEventListener('mousemove', (event) => {
        event.preventDefault()
        if (isPanning) { return }
        if (mouseDraw) {
            mouseDraw.lastPos = mouseDraw.pos
            mouseDraw.pos = {
                x: event.x * pixelRatio,
                y: event.y * pixelRatio,
                timestamp: event.timeStamp || now(),
            }
            draw(mouseDraw)
        }
    })

    const mouseup = (event) => {
        mouseDraw = undefined
    }
    canvas.addEventListener('mouseup', mouseup)
    canvas.addEventListener('mouseleave', mouseup)

    let fingerDraw: {[id: number]: DrawEvent} = {}
    let panTouch: number|undefined

    canvas.addEventListener('touchstart', (event) => {
        event.preventDefault()
        if (isPanning) {
            if (!panTouch) {
                for (var i = 0; i < event.touches.length; i++) {
                    const touch = event.touches[i]
                    if (touch.target === panHandle) { continue }
                    panTouch = touch.identifier
                    panStart({x: touch.screenX, y: touch.screenY})
                    break
                }
            }
            return
        }
        for (var i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i]
            const x = touch.screenX * pixelRatio
            const y = touch.screenY * pixelRatio
            const color = activeColor === -1 ? pickColor(x, y) : activeColor
            fingerDraw[touch.identifier] = {
                pos: {x, y, timestamp: event.timeStamp || now()}, color, force: touch['force']
            }
            draw(fingerDraw[touch.identifier])
        }
    })

    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault()
        if (isPanning) {
            if (panTouch) {
                for (var i = 0; i < event.touches.length; i++) {
                    const touch = event.touches[i]
                    if (touch.identifier == panTouch) {
                        panMove({x: touch.screenX, y: touch.screenY})
                        break
                    }
                }
            }
            return
        }
        for (var i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i]
            const drawEvent = fingerDraw[touch.identifier]
            if (drawEvent) {
                drawEvent.lastPos = drawEvent.pos
                drawEvent.pos = {
                    x: touch.screenX * pixelRatio,
                    y: touch.screenY * pixelRatio,
                    timestamp: event.timeStamp || now(),
                }
                drawEvent.force = touch['force']
                draw(drawEvent)
            }
        }
    })

    const touchend = (event: TouchEvent) => {
        event.preventDefault()
        if (isPanning) {
            if (panTouch) {
                panEnd()
                panTouch = undefined
            }
            return
        }
        for (var i = 0; i < event.touches.length; i++) {
            const touch = event.touches[i]
            delete fingerDraw[touch.identifier]
        }
    }
    canvas.addEventListener('touchend', touchend)
    canvas.addEventListener('touchcancel', touchend)
}
