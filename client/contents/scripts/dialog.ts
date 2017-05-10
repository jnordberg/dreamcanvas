
export interface IDialogOptions {
    className?: string
}

export interface IShowDialogOptions {
    title: string
    html: string
    button: string
}

export default class Dialog {

    private document: Document
    private container: HTMLDivElement
    private element: HTMLDivElement

    constructor(private window: Window, public readonly options: IDialogOptions = {}) {
        this.document = window.document
        this.container = this.document.createElement('div')
        this.container.className = options.className || 'dialog'
        this.element = this.document.createElement('div')
        this.element.className = 'content'
        this.container.appendChild(this.element)
        this.document.body.appendChild(this.container)
    }

    async show(options: IShowDialogOptions) {
        return new Promise<void>((resolve, reject) => {
            this.element.innerHTML = [
                '<div class="title">', options.title, '</div>',
                '<div class="body">', options.html, '</div>',
                '<div class="buttons"><button>', options.button, '</button></div>',
            ].join('')
            this.element.querySelector('button').addEventListener('click', (event) => {
                event.preventDefault()
                this.container.classList.remove('visible')
                resolve()
            })
            this.container.classList.add('visible')
        })
    }
}
