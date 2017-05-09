# adapted from https://github.com/tensorflow/tensorflow/tree/master/tensorflow/examples/tutorials/deepdream

import numpy as np
import os
import sys
import tensorflow as tf
import time

from io import BytesIO
from PIL import Image

model_fn = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../model/tensorflow_inception_graph.pb')
# creating TensorFlow session and loading the model
graph = tf.Graph()
sess = tf.InteractiveSession(graph=graph)
with tf.gfile.FastGFile(model_fn, 'rb') as f:
    graph_def = tf.GraphDef()
    graph_def.ParseFromString(f.read())
t_input = tf.placeholder(np.float32, name='input') # define the input tensor
imagenet_mean = 117.0
t_preprocessed = tf.expand_dims(t_input-imagenet_mean, 0)
tf.import_graph_def(graph_def, {'input':t_preprocessed})

# print(graph.get_operations())

def T(layer):
    '''Helper for getting layer output tensor'''
    return graph.get_tensor_by_name("import/%s:0"%layer)

def tffunc(*argtypes):
    '''Helper that transforms TF-graph generating function into a regular one.
    See "resize" function below.
    '''
    placeholders = list(map(tf.placeholder, argtypes))
    def wrap(f):
        out = f(*placeholders)
        def wrapper(*args, **kw):
            return out.eval(dict(zip(placeholders, args)), session=kw.get('session'))
        return wrapper
    return wrap

# Helper function that uses TF to resize an image
def resize(img, size):
    img = tf.expand_dims(img, 0)
    return tf.image.resize_bilinear(img, size)[0,:,:,:]
resize = tffunc(np.float32, np.int32)(resize)

def calc_grad_tiled(img, t_grad, tile_size=512):
    '''Compute the value of tensor t_grad over the image in a tiled way.
    Random shifts are applied to the image to blur tile boundaries over
    multiple iterations.'''
    sz = tile_size
    h, w = img.shape[:2]
    sx, sy = np.random.randint(sz, size=2)
    img_shift = np.roll(np.roll(img, sx, 1), sy, 0)
    grad = np.zeros_like(img)
    for y in range(0, max(h-sz//2, sz),sz):
        for x in range(0, max(w-sz//2, sz),sz):
            sub = img_shift[y:y+sz,x:x+sz]
            g = sess.run(t_grad, {t_input:sub})
            grad[y:y+sz,x:x+sz] = g
    return np.roll(np.roll(grad, -sx, 1), -sy, 0)

def render_deepdream(t_grad, img0, iter_n=10, step=1.5, octave_n=4, octave_scale=1.4):
    # split the image into a number of octaves
    img = img0
    octaves = []
    for i in range(octave_n-1):
        hw = img.shape[:2]
        lo = resize(img, np.int32(np.float32(hw)/octave_scale))
        hi = img-resize(lo, hw)
        img = lo
        octaves.append(hi)

    # generate details octave by octave
    for octave in range(octave_n):
        if octave>0:
            hi = octaves[-octave]
            img = resize(img, hi.shape[:2])+hi
        for i in range(iter_n):
            g = calc_grad_tiled(img, t_grad)
            img += g*(step / (np.abs(g).mean()+1e-7))

    return Image.fromarray(np.uint8(np.clip(img/255.0, 0, 1)*255))

last_layer = None
last_grad = None
last_channel = None
def render(img, layer='mixed4d_3x3_bottleneck_pre_relu', channel=139, iter_n=10, step=1.5, octave_n=4, octave_scale=1.4):
    global last_layer, last_grad, last_channel
    if last_layer == layer and last_channel == channel:
        t_grad = last_grad
    else:
        if channel == 4242:
            t_obj = tf.square(T(layer))
        else:
            t_obj = T(layer)[:,:,:,channel]
        t_score = tf.reduce_mean(t_obj) # defining the optimization objective
        t_grad = tf.gradients(t_score, t_input)[0] # behold the power of automatic differentiation!
        last_layer = layer
        last_grad = t_grad
        last_channel = channel
    img0 = np.float32(img)
    return render_deepdream(t_grad, img0, iter_n, step, octave_n, octave_scale)


# num_iters = int(os.getenv('NUM_ITERS', '10'))
# layer = os.getenv('LAYER', 'mixed3a_5x5_bottleneck_pre_relu')
# channel = int(os.getenv('CHANNEL', '4'))

# flowers          mixed4d_3x3_bottleneck_pre_relu 139
# muted swirls     mixed3a_5x5_bottleneck_pre_relu 2


# [
# 'input' type=Placeholder>,
# 'sub/y' type=Const>,
# 'sub' type=Sub>,
# 'ExpandDims/dim' type=Const>,
# 'ExpandDims' type=ExpandDims>,
# 'import/input' type=Placeholder>,
# 'import/conv2d0_w' type=Const>,
# 'import/conv2d0_b' type=Const>,
# 'import/conv2d1_w' type=Const>,
# 'import/conv2d1_b' type=Const>,
# 'import/conv2d2_w' type=Const>,
# 'import/conv2d2_b' type=Const>,
# 'import/mixed3a_1x1_w' type=Const>,
# 'import/mixed3a_1x1_b' type=Const>,
# 'import/mixed3a_3x3_bottleneck_w' type=Const>,
# 'import/mixed3a_3x3_bottleneck_b' type=Const>,
# 'import/mixed3a_3x3_w' type=Const>,
# 'import/mixed3a_3x3_b' type=Const>,
# 'import/mixed3a_5x5_bottleneck_w' type=Const>,
# 'import/mixed3a_5x5_bottleneck_b' type=Const>,
# 'import/mixed3a_5x5_w' type=Const>,
# 'import/mixed3a_5x5_b' type=Const>,
# 'import/mixed3a_pool_reduce_w' type=Const>,
# 'import/mixed3a_pool_reduce_b' type=Const>,
# 'import/mixed3b_1x1_w' type=Const>,
# 'import/mixed3b_1x1_b' type=Const>,
# 'import/mixed3b_3x3_bottleneck_w' type=Const>,
# 'import/mixed3b_3x3_bottleneck_b' type=Const>,
# 'import/mixed3b_3x3_w' type=Const>,
# 'import/mixed3b_3x3_b' type=Const>,
# 'import/mixed3b_5x5_bottleneck_w' type=Const>,
# 'import/mixed3b_5x5_bottleneck_b' type=Const>,
# 'import/mixed3b_5x5_w' type=Const>,
# 'import/mixed3b_5x5_b' type=Const>,
# 'import/mixed3b_pool_reduce_w' type=Const>,
# 'import/mixed3b_pool_reduce_b' type=Const>,
# 'import/mixed4a_1x1_w' type=Const>,
# 'import/mixed4a_1x1_b' type=Const>,
# 'import/mixed4a_3x3_bottleneck_w' type=Const>,
# 'import/mixed4a_3x3_bottleneck_b' type=Const>,
# 'import/mixed4a_3x3_w' type=Const>,
# 'import/mixed4a_3x3_b' type=Const>,
# 'import/mixed4a_5x5_bottleneck_w' type=Const>,
# 'import/mixed4a_5x5_bottleneck_b' type=Const>,
# 'import/mixed4a_5x5_w' type=Const>,
# 'import/mixed4a_5x5_b' type=Const>,
# 'import/mixed4a_pool_reduce_w' type=Const>,
# 'import/mixed4a_pool_reduce_b' type=Const>,
# 'import/mixed4b_1x1_w' type=Const>,
# 'import/mixed4b_1x1_b' type=Const>,
# 'import/mixed4b_3x3_bottleneck_w' type=Const>,
# 'import/mixed4b_3x3_bottleneck_b' type=Const>,
# 'import/mixed4b_3x3_w' type=Const>,
# 'import/mixed4b_3x3_b' type=Const>,
# 'import/mixed4b_5x5_bottleneck_w' type=Const>,
# 'import/mixed4b_5x5_bottleneck_b' type=Const>,
# 'import/mixed4b_5x5_w' type=Const>,
# 'import/mixed4b_5x5_b' type=Const>,
# 'import/mixed4b_pool_reduce_w' type=Const>,
# 'import/mixed4b_pool_reduce_b' type=Const>,
# 'import/mixed4c_1x1_w' type=Const>,
# 'import/mixed4c_1x1_b' type=Const>,
# 'import/mixed4c_3x3_bottleneck_w' type=Const>,
# 'import/mixed4c_3x3_bottleneck_b' type=Const>,
# 'import/mixed4c_3x3_w' type=Const>,
# 'import/mixed4c_3x3_b' type=Const>,
# 'import/mixed4c_5x5_bottleneck_w' type=Const>,
# 'import/mixed4c_5x5_bottleneck_b' type=Const>,
# 'import/mixed4c_5x5_w' type=Const>,
# 'import/mixed4c_5x5_b' type=Const>,
# 'import/mixed4c_pool_reduce_w' type=Const>,
# 'import/mixed4c_pool_reduce_b' type=Const>,
# 'import/mixed4d_1x1_w' type=Const>,
# 'import/mixed4d_1x1_b' type=Const>,
# 'import/mixed4d_3x3_bottleneck_w' type=Const>,
# 'import/mixed4d_3x3_bottleneck_b' type=Const>,
# 'import/mixed4d_3x3_w' type=Const>,
# 'import/mixed4d_3x3_b' type=Const>,
# 'import/mixed4d_5x5_bottleneck_w' type=Const>,
# 'import/mixed4d_5x5_bottleneck_b' type=Const>,
# 'import/mixed4d_5x5_w' type=Const>,
# 'import/mixed4d_5x5_b' type=Const>,
# 'import/mixed4d_pool_reduce_w' type=Const>,
# 'import/mixed4d_pool_reduce_b' type=Const>,
# 'import/mixed4e_1x1_w' type=Const>,
# 'import/mixed4e_1x1_b' type=Const>,
# 'import/mixed4e_3x3_bottleneck_w' type=Const>,
# 'import/mixed4e_3x3_bottleneck_b' type=Const>,
# 'import/mixed4e_3x3_w' type=Const>,
# 'import/mixed4e_3x3_b' type=Const>,
# 'import/mixed4e_5x5_bottleneck_w' type=Const>,
# 'import/mixed4e_5x5_bottleneck_b' type=Const>,
# 'import/mixed4e_5x5_w' type=Const>,
# 'import/mixed4e_5x5_b' type=Const>,
# 'import/mixed4e_pool_reduce_w' type=Const>,
# 'import/mixed4e_pool_reduce_b' type=Const>,
# 'import/mixed5a_1x1_w' type=Const>,
# 'import/mixed5a_1x1_b' type=Const>,
# 'import/mixed5a_3x3_bottleneck_w' type=Const>,
# 'import/mixed5a_3x3_bottleneck_b' type=Const>,
# 'import/mixed5a_3x3_w' type=Const>,
# 'import/mixed5a_3x3_b' type=Const>,
# 'import/mixed5a_5x5_bottleneck_w' type=Const>,
# 'import/mixed5a_5x5_bottleneck_b' type=Const>,
# 'import/mixed5a_5x5_w' type=Const>,
# 'import/mixed5a_5x5_b' type=Const>,
# 'import/mixed5a_pool_reduce_w' type=Const>,
# 'import/mixed5a_pool_reduce_b' type=Const>,
# 'import/mixed5b_1x1_w' type=Const>,
# 'import/mixed5b_1x1_b' type=Const>,
# 'import/mixed5b_3x3_bottleneck_w' type=Const>,
# 'import/mixed5b_3x3_bottleneck_b' type=Const>,
# 'import/mixed5b_3x3_w' type=Const>,
# 'import/mixed5b_3x3_b' type=Const>,
# 'import/mixed5b_5x5_bottleneck_w' type=Const>,
# 'import/mixed5b_5x5_bottleneck_b' type=Const>,
# 'import/mixed5b_5x5_w' type=Const>,
# 'import/mixed5b_5x5_b' type=Const>,
# 'import/mixed5b_pool_reduce_w' type=Const>,
# 'import/mixed5b_pool_reduce_b' type=Const>,
# 'import/head0_bottleneck_w' type=Const>,
# 'import/head0_bottleneck_b' type=Const>,
# 'import/nn0_w' type=Const>,
# 'import/nn0_b' type=Const>,
# 'import/softmax0_w' type=Const>,
# 'import/softmax0_b' type=Const>,
# 'import/head1_bottleneck_w' type=Const>,
# 'import/head1_bottleneck_b' type=Const>,
# 'import/nn1_w' type=Const>,
# 'import/nn1_b' type=Const>,
# 'import/softmax1_w' type=Const>,
# 'import/softmax1_b' type=Const>,
# 'import/softmax2_w' type=Const>,
# 'import/softmax2_b' type=Const>,
# 'import/conv2d0_pre_relu/conv' type=Conv2D>,
# 'import/conv2d0_pre_relu' type=BiasAdd>,
# 'import/conv2d0' type=Relu>,
# 'import/maxpool0' type=MaxPool>,
# 'import/localresponsenorm0' type=LRN>,
# 'import/conv2d1_pre_relu/conv' type=Conv2D>,
# 'import/conv2d1_pre_relu' type=BiasAdd>,
# 'import/conv2d1' type=Relu>,
# 'import/conv2d2_pre_relu/conv' type=Conv2D>,
# 'import/conv2d2_pre_relu' type=BiasAdd>,
# 'import/conv2d2' type=Relu>,
# 'import/localresponsenorm1' type=LRN>,
# 'import/maxpool1' type=MaxPool>,
# 'import/mixed3a_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed3a_1x1' type=Relu>,
# 'import/mixed3a_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed3a_3x3_bottleneck' type=Relu>,
# 'import/mixed3a_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed3a_3x3' type=Relu>,
# 'import/mixed3a_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed3a_5x5_bottleneck' type=Relu>,
# 'import/mixed3a_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed3a_5x5' type=Relu>,
# 'import/mixed3a_pool' type=MaxPool>,
# 'import/mixed3a_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed3a_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed3a_pool_reduce' type=Relu>,
# 'import/mixed3a/concat_dim' type=Const>,
# 'import/mixed3a' type=Concat>,
# 'import/mixed3b_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed3b_1x1' type=Relu>,
# 'import/mixed3b_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed3b_3x3_bottleneck' type=Relu>,
# 'import/mixed3b_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed3b_3x3' type=Relu>,
# 'import/mixed3b_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed3b_5x5_bottleneck' type=Relu>,
# 'import/mixed3b_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed3b_5x5' type=Relu>,
# 'import/mixed3b_pool' type=MaxPool>,
# 'import/mixed3b_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed3b_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed3b_pool_reduce' type=Relu>,
# 'import/mixed3b/concat_dim' type=Const>,
# 'import/mixed3b' type=Concat>,
# 'import/maxpool4' type=MaxPool>,
# 'import/mixed4a_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed4a_1x1' type=Relu>,
# 'import/mixed4a_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4a_3x3_bottleneck' type=Relu>,
# 'import/mixed4a_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed4a_3x3' type=Relu>,
# 'import/mixed4a_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4a_5x5_bottleneck' type=Relu>,
# 'import/mixed4a_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed4a_5x5' type=Relu>,
# 'import/mixed4a_pool' type=MaxPool>,
# 'import/mixed4a_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed4a_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed4a_pool_reduce' type=Relu>,
# 'import/mixed4a/concat_dim' type=Const>,
# 'import/mixed4a' type=Concat>,
# 'import/mixed4b_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed4b_1x1' type=Relu>,
# 'import/mixed4b_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4b_3x3_bottleneck' type=Relu>,
# 'import/mixed4b_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed4b_3x3' type=Relu>,
# 'import/mixed4b_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4b_5x5_bottleneck' type=Relu>,
# 'import/mixed4b_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed4b_5x5' type=Relu>,
# 'import/mixed4b_pool' type=MaxPool>,
# 'import/mixed4b_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed4b_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed4b_pool_reduce' type=Relu>,
# 'import/mixed4b/concat_dim' type=Const>,
# 'import/mixed4b' type=Concat>,
# 'import/mixed4c_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed4c_1x1' type=Relu>,
# 'import/mixed4c_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4c_3x3_bottleneck' type=Relu>,
# 'import/mixed4c_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed4c_3x3' type=Relu>,
# 'import/mixed4c_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4c_5x5_bottleneck' type=Relu>,
# 'import/mixed4c_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed4c_5x5' type=Relu>,
# 'import/mixed4c_pool' type=MaxPool>,
# 'import/mixed4c_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed4c_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed4c_pool_reduce' type=Relu>,
# 'import/mixed4c/concat_dim' type=Const>,
# 'import/mixed4c' type=Concat>,
# 'import/mixed4d_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed4d_1x1' type=Relu>,
# 'import/mixed4d_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4d_3x3_bottleneck' type=Relu>,
# 'import/mixed4d_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed4d_3x3' type=Relu>,
# 'import/mixed4d_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4d_5x5_bottleneck' type=Relu>,
# 'import/mixed4d_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed4d_5x5' type=Relu>,
# 'import/mixed4d_pool' type=MaxPool>,
# 'import/mixed4d_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed4d_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed4d_pool_reduce' type=Relu>,
# 'import/mixed4d/concat_dim' type=Const>,
# 'import/mixed4d' type=Concat>,
# 'import/mixed4e_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed4e_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed4e_1x1' type=Relu>,
# 'import/mixed4e_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4e_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4e_3x3_bottleneck' type=Relu>,
# 'import/mixed4e_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed4e_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed4e_3x3' type=Relu>,
# 'import/mixed4e_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed4e_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed4e_5x5_bottleneck' type=Relu>,
# 'import/mixed4e_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed4e_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed4e_5x5' type=Relu>,
# 'import/mixed4e_pool' type=MaxPool>,
# 'import/mixed4e_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/2' type=BiasAdd>,
# 'import/mixed4e_pool_reduce' type=Relu>,
# 'import/mixed4e/concat_dim' type=Const>,
# 'import/mixed4e' type=Concat>,
# 'import/maxpool10' type=MaxPool>,
# 'import/mixed5a_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed5a_1x1' type=Relu>,
# 'import/mixed5a_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed5a_3x3_bottleneck' type=Relu>,
# 'import/mixed5a_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed5a_3x3' type=Relu>,
# 'import/mixed5a_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed5a_5x5_bottleneck' type=Relu>,
# 'import/mixed5a_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed5a_5x5' type=Relu>,
# 'import/mixed5a_pool' type=MaxPool>,
# 'import/mixed5a_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed5a_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed5a_pool_reduce' type=Relu>,
# 'import/mixed5a/concat_dim' type=Const>,
# 'import/mixed5a' type=Concat>,
# 'import/mixed5b_1x1_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_1x1_pre_relu' type=BiasAdd>,
# 'import/mixed5b_1x1' type=Relu>,
# 'import/mixed5b_3x3_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_3x3_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed5b_3x3_bottleneck' type=Relu>,
# 'import/mixed5b_3x3_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_3x3_pre_relu' type=BiasAdd>,
# 'import/mixed5b_3x3' type=Relu>,
# 'import/mixed5b_5x5_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_5x5_bottleneck_pre_relu' type=BiasAdd>,
# 'import/mixed5b_5x5_bottleneck' type=Relu>,
# 'import/mixed5b_5x5_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_5x5_pre_relu' type=BiasAdd>,
# 'import/mixed5b_5x5' type=Relu>,
# 'import/mixed5b_pool' type=MaxPool>,
# 'import/mixed5b_pool_reduce_pre_relu/conv' type=Conv2D>,
# 'import/mixed5b_pool_reduce_pre_relu' type=BiasAdd>,
# 'import/mixed5b_pool_reduce' type=Relu>,
# 'import/mixed5b/concat_dim' type=Const>,
# 'import/mixed5b' type=Concat>,
# 'import/avgpool0' type=AvgPool>,
# 'import/head0_pool' type=AvgPool>,
# 'import/head0_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/head0_bottleneck_pre_relu' type=BiasAdd>,
# 'import/head0_bottleneck' type=Relu>,
# 'import/head0_bottleneck/reshape/shape' type=Const>,
# 'import/head0_bottleneck/reshape' type=Reshape>,
# 'import/nn0_pre_relu/matmul' type=MatMul>,
# 'import/nn0_pre_relu' type=BiasAdd>,
# 'import/nn0' type=Relu>,
# 'import/nn0/reshape/shape' type=Const>,
# 'import/nn0/reshape' type=Reshape>,
# 'import/softmax0_pre_activation/matmul' type=MatMul>,
# 'import/softmax0_pre_activation' type=BiasAdd>,
# 'import/softmax0' type=Softmax>,
# 'import/head1_pool' type=AvgPool>,
# 'import/head1_bottleneck_pre_relu/conv' type=Conv2D>,
# 'import/head1_bottleneck_pre_relu' type=BiasAdd>,
# 'import/head1_bottleneck' type=Relu>,
# 'import/head1_bottleneck/reshape/shape' type=Const>,
# 'import/head1_bottleneck/reshape' type=Reshape>,
# 'import/nn1_pre_relu/matmul' type=MatMul>,
# 'import/nn1_pre_relu' type=BiasAdd>,
# 'import/nn1' type=Relu>,
# 'import/nn1/reshape/shape' type=Const>,
# 'import/nn1/reshape' type=Reshape>,
# 'import/softmax1_pre_activation/matmul' type=MatMul>,
# 'import/softmax1_pre_activation' type=BiasAdd>,
# 'import/softmax1' type=Softmax>,
# 'import/avgpool0/reshape/shape' type=Const>,
# 'import/avgpool0/reshape' type=Reshape>,
# 'import/softmax2_pre_activation/matmul' type=MatMul>,
# 'import/softmax2_pre_activation' type=BiasAdd>,
# 'import/softmax2' type=Softmax>,
# 'import/output' type=Identity>, <tf.Operation 'import/output1' type=Identity>, <tf.Operation 'import/output2' type=Identity>]