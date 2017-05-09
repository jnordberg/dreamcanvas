---
template: page.html
title: About
---

# Dreamcanvas

Ever dreamed about making art together with an artificial intelligence? No? Well now you can anyways! This canvas lets users who visit draw anything they please and every couple of seconds the drawing is interpreted by a neural network using [Google's DeepDream technique](https://en.wikipedia.org/wiki/DeepDream).

---

This server costs me about $20 per day to run due to the amount of processing power needed. Give me some money to support this and future projects!

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
<div class="button">
    <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
    <input type="hidden" name="cmd" value="_s-xclick">
    <input type="hidden" name="hosted_button_id" value="LMHBUBVMDKL7U">
    <input type="image" src="https://www.paypalobjects.com/en_GB/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online!">
    <img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">
    </form>
</div>
</div>

---

## FAQ

### How was this made?

Using [TensorFlow](https://www.tensorflow.org) and [wsrpc](https://github.com/jnordberg/wsrpc), the source code is up here: <https://github.com/jnordberg/dreamcanvas>

### Who made this?

I did! Johan Nordberg, follow me on Twitter [@almost_digital](https://twitter.com/almost_digital).

---

[Got another question?](mailto:dreamcanvas@johan-nordberg.com)





