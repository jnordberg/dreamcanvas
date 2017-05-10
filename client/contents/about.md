---
template: page.html
title: About
---

# Dreamcanvas

Ever dreamed about making art together with an artificial intelligence? No? Well now you can anyway! This canvas lets users who visit draw anything they please and every couple of seconds the drawing is interpreted by a neural network using [Google's DeepDream technique](https://en.wikipedia.org/wiki/DeepDream).

This server costs me about $30 per day to run due to the amount of processing power needed. If you enjoyed this please consider donating a small sum:

<div id="donation-buttons">
<script src="//blockr.io/js_external/coinwidget/coin.js"></script>
<script>CoinWidgetCom.go({
    wallet_address: \`1DreamTXogBHggAn9rR6MxU57ZGxe3yJqK\`,
    currency: \`bitcoin\`,
    counter: \`count\`,
    lbl_button: \`Donate\`,
    lbl_count: \`donations\`,
    lbl_amount: \`BTC\`,
    lbl_address: \`Use address below to donate. Thanks!\`,
    qrcode: true,
    alignment: \`bl\`,
    decimals: 8,
    size: \`small\`,
    color: \`dark\`,
    countdownFrom: \`0\`,
    element: \`#coinwidget-bitcoin-1DreamTXogBHggAn9rR6MxU57ZGxe3yJqK\`
});</script>
<div class="button" id="coinwidget-bitcoin-1DreamTXogBHggAn9rR6MxU57ZGxe3yJqK"></div>
<div class="button" style="margin-top: .3em">
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="hosted_button_id" value="LMHBUBVMDKL7U">
    <input type="image" src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="Donate with PayPal">
    </form>
</div>
</div>

## FAQ

### How was this made?

Using [TensorFlow](https://www.tensorflow.org), [wsrpc](https://github.com/jnordberg/wsrpc) and a bunch of other things. [The source code is up on GitHub](https://github.com/jnordberg/dreamcanvas).

### Who made this?

I did! Johan Nordberg, follow me on Twitter [@almost_digital](https://twitter.com/almost_digital).

### Are you recording the canvas?

Yes! [Check here for the history](https://dream.almost.digital/history), images are compressed to movie files every other hour.

---

[Got another question?](mailto:dreamcanvas@johan-nordberg.com)
