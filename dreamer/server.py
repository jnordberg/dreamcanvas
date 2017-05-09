from concurrent import futures
from io import BytesIO
from PIL import Image
import dream_pb2
import dream_pb2_grpc
import grpc
import time

class Dreamer(dream_pb2_grpc.DreamerServicer):

    def Dream(self, request, context):
        import dream
        print('dream %s %d' % (request.layer, request.channel))
        img = Image.open(BytesIO(request.image))
        result = dream.render(img, layer=request.layer, channel=request.channel, iter_n=2, octave_n=6, octave_scale=1.31415)
        buffer = BytesIO()
        result.save(buffer, 'png')
        return dream_pb2.DreamResponse(image=buffer.getvalue())

def serve():
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=1),
        options=(('grpc.max_message_length', 70105240,),)
    )
    dream_pb2_grpc.add_DreamerServicer_to_server(Dreamer(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(60 * 60 * 24)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    serve()
