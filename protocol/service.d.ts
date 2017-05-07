import * as $protobuf from "protobufjs";

/** Represents a Painter */
export class Painter extends $protobuf.rpc.Service {

    /**
     * Constructs a new Painter service.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     */
    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

    /**
     * Creates new Painter service using the specified rpc implementation.
     * @param rpcImpl RPC implementation
     * @param [requestDelimited=false] Whether requests are length-delimited
     * @param [responseDelimited=false] Whether responses are length-delimited
     * @returns RPC service. Useful where requests and/or responses are streamed.
     */
    public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Painter;

    /**
     * Calls GetCanvas.
     * @param request CanvasRequest message or plain object
     * @param callback Node-style callback called with the error, if any, and CanvasResponse
     */
    public getCanvas(request: ICanvasRequest, callback: Painter.GetCanvasCallback): void;

    /**
     * Calls GetCanvas.
     * @param request CanvasRequest message or plain object
     * @returns Promise
     */
    public getCanvas(request: ICanvasRequest): Promise<CanvasResponse>;

    /**
     * Calls Paint.
     * @param request PaintEvent message or plain object
     * @param callback Node-style callback called with the error, if any, and Empty
     */
    public paint(request: IPaintEvent, callback: Painter.PaintCallback): void;

    /**
     * Calls Paint.
     * @param request PaintEvent message or plain object
     * @returns Promise
     */
    public paint(request: IPaintEvent): Promise<Empty>;
}

export namespace Painter {

    /**
     * Callback as used by {@link Painter#getCanvas}.
     * @param error Error, if any
     * @param [response] CanvasResponse
     */
    type GetCanvasCallback = (error: (Error|null), response?: CanvasResponse) => void;

    /**
     * Callback as used by {@link Painter#paint}.
     * @param error Error, if any
     * @param [response] Empty
     */
    type PaintCallback = (error: (Error|null), response?: Empty) => void;
}

/** Properties of an Empty. */
export interface IEmpty {
}

/** Represents an Empty. */
export class Empty {

    /**
     * Constructs a new Empty.
     * @param [properties] Properties to set
     */
    constructor(properties?: IEmpty);

    /**
     * Creates a new Empty instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Empty instance
     */
    public static create(properties?: IEmpty): Empty;

    /**
     * Encodes the specified Empty message. Does not implicitly {@link Empty.verify|verify} messages.
     * @param message Empty message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Empty message, length delimited. Does not implicitly {@link Empty.verify|verify} messages.
     * @param message Empty message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes an Empty message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Empty
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Empty;

    /**
     * Decodes an Empty message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Empty
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Empty;

    /**
     * Verifies an Empty message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates an Empty message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Empty
     */
    public static fromObject(object: { [k: string]: any }): Empty;

    /**
     * Creates a plain object from an Empty message. Also converts values to other types if specified.
     * @param message Empty
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Empty to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a Position. */
export interface IPosition {

    /** Position x */
    x: number;

    /** Position y */
    y: number;
}

/** Represents a Position. */
export class Position {

    /**
     * Constructs a new Position.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPosition);

    /** Position x. */
    public x: number;

    /** Position y. */
    public y: number;

    /**
     * Creates a new Position instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Position instance
     */
    public static create(properties?: IPosition): Position;

    /**
     * Encodes the specified Position message. Does not implicitly {@link Position.verify|verify} messages.
     * @param message Position message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Position message, length delimited. Does not implicitly {@link Position.verify|verify} messages.
     * @param message Position message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Position message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Position
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Position;

    /**
     * Decodes a Position message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Position
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Position;

    /**
     * Verifies a Position message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Position message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Position
     */
    public static fromObject(object: { [k: string]: any }): Position;

    /**
     * Creates a plain object from a Position message. Also converts values to other types if specified.
     * @param message Position
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Position to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a PaintEvent. */
export interface IPaintEvent {

    /** PaintEvent pos */
    pos: IPosition;

    /** PaintEvent size */
    size: number;

    /** PaintEvent color */
    color: number;
}

/** Represents a PaintEvent. */
export class PaintEvent {

    /**
     * Constructs a new PaintEvent.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPaintEvent);

    /** PaintEvent pos. */
    public pos: IPosition;

    /** PaintEvent size. */
    public size: number;

    /** PaintEvent color. */
    public color: number;

    /**
     * Creates a new PaintEvent instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PaintEvent instance
     */
    public static create(properties?: IPaintEvent): PaintEvent;

    /**
     * Encodes the specified PaintEvent message. Does not implicitly {@link PaintEvent.verify|verify} messages.
     * @param message PaintEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPaintEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PaintEvent message, length delimited. Does not implicitly {@link PaintEvent.verify|verify} messages.
     * @param message PaintEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPaintEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PaintEvent message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PaintEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PaintEvent;

    /**
     * Decodes a PaintEvent message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PaintEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PaintEvent;

    /**
     * Verifies a PaintEvent message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PaintEvent message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PaintEvent
     */
    public static fromObject(object: { [k: string]: any }): PaintEvent;

    /**
     * Creates a plain object from a PaintEvent message. Also converts values to other types if specified.
     * @param message PaintEvent
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PaintEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PaintEvent to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a StatusEvent. */
export interface IStatusEvent {

    /** StatusEvent users */
    users: number;
}

/** Represents a StatusEvent. */
export class StatusEvent {

    /**
     * Constructs a new StatusEvent.
     * @param [properties] Properties to set
     */
    constructor(properties?: IStatusEvent);

    /** StatusEvent users. */
    public users: number;

    /**
     * Creates a new StatusEvent instance using the specified properties.
     * @param [properties] Properties to set
     * @returns StatusEvent instance
     */
    public static create(properties?: IStatusEvent): StatusEvent;

    /**
     * Encodes the specified StatusEvent message. Does not implicitly {@link StatusEvent.verify|verify} messages.
     * @param message StatusEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IStatusEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified StatusEvent message, length delimited. Does not implicitly {@link StatusEvent.verify|verify} messages.
     * @param message StatusEvent message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IStatusEvent, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a StatusEvent message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns StatusEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): StatusEvent;

    /**
     * Decodes a StatusEvent message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns StatusEvent
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): StatusEvent;

    /**
     * Verifies a StatusEvent message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a StatusEvent message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns StatusEvent
     */
    public static fromObject(object: { [k: string]: any }): StatusEvent;

    /**
     * Creates a plain object from a StatusEvent message. Also converts values to other types if specified.
     * @param message StatusEvent
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: StatusEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this StatusEvent to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

/** Properties of a CanvasRequest. */
export interface ICanvasRequest {

    /** CanvasRequest offset */
    offset: IPosition;

    /** CanvasRequest width */
    width: number;

    /** CanvasRequest height */
    height: number;

    /** CanvasRequest encoding */
    encoding: CanvasRequest.Encoding;
}

/** Represents a CanvasRequest. */
export class CanvasRequest {

    /**
     * Constructs a new CanvasRequest.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICanvasRequest);

    /** CanvasRequest offset. */
    public offset: IPosition;

    /** CanvasRequest width. */
    public width: number;

    /** CanvasRequest height. */
    public height: number;

    /** CanvasRequest encoding. */
    public encoding: CanvasRequest.Encoding;

    /**
     * Creates a new CanvasRequest instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CanvasRequest instance
     */
    public static create(properties?: ICanvasRequest): CanvasRequest;

    /**
     * Encodes the specified CanvasRequest message. Does not implicitly {@link CanvasRequest.verify|verify} messages.
     * @param message CanvasRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICanvasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CanvasRequest message, length delimited. Does not implicitly {@link CanvasRequest.verify|verify} messages.
     * @param message CanvasRequest message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICanvasRequest, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CanvasRequest message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CanvasRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CanvasRequest;

    /**
     * Decodes a CanvasRequest message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CanvasRequest
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CanvasRequest;

    /**
     * Verifies a CanvasRequest message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CanvasRequest message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CanvasRequest
     */
    public static fromObject(object: { [k: string]: any }): CanvasRequest;

    /**
     * Creates a plain object from a CanvasRequest message. Also converts values to other types if specified.
     * @param message CanvasRequest
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CanvasRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CanvasRequest to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace CanvasRequest {

    /** Encoding enum. */
    enum Encoding {
        PNG = 1,
        JPEG = 2,
        WEBP = 3
    }
}

/** Properties of a CanvasResponse. */
export interface ICanvasResponse {

    /** CanvasResponse image */
    image: Uint8Array;
}

/** Represents a CanvasResponse. */
export class CanvasResponse {

    /**
     * Constructs a new CanvasResponse.
     * @param [properties] Properties to set
     */
    constructor(properties?: ICanvasResponse);

    /** CanvasResponse image. */
    public image: Uint8Array;

    /**
     * Creates a new CanvasResponse instance using the specified properties.
     * @param [properties] Properties to set
     * @returns CanvasResponse instance
     */
    public static create(properties?: ICanvasResponse): CanvasResponse;

    /**
     * Encodes the specified CanvasResponse message. Does not implicitly {@link CanvasResponse.verify|verify} messages.
     * @param message CanvasResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ICanvasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified CanvasResponse message, length delimited. Does not implicitly {@link CanvasResponse.verify|verify} messages.
     * @param message CanvasResponse message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ICanvasResponse, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a CanvasResponse message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns CanvasResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): CanvasResponse;

    /**
     * Decodes a CanvasResponse message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns CanvasResponse
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): CanvasResponse;

    /**
     * Verifies a CanvasResponse message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a CanvasResponse message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns CanvasResponse
     */
    public static fromObject(object: { [k: string]: any }): CanvasResponse;

    /**
     * Creates a plain object from a CanvasResponse message. Also converts values to other types if specified.
     * @param message CanvasResponse
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: CanvasResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this CanvasResponse to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}
