# Remote Control

Mute your web browser from your phone.

I watch TV on a web browser (from my couch) and the ads are always
insanely loud (WTF!) so I wanted to mute the ads.
I guess I should get a proper box or something but, whatever, I hacked
the first working prototype of this in less than 2 hours.
It's probably broken by the time you read this but I swear it used to work.

Instructions:
* Install the Firefox/Chrome extension.
* Click the browser action and you'll see a five character code.
* Open [bit.ly/rem-c](http://bit.ly/rem-c) on your phone.
* Type in the code.
* Press the mute / unmute button as needed.

## Development tips

### The browser extension bit

Set yourself up with [NodeJS](http://nodejs.org/)
and [yarn](https://yarnpkg.com/). Install all the things:

    yarn install

Start the source builder in your terminal:

    npm run build

## Development in Firefox

Make sure you have
[Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/)
installed.
Type this in a shell to launch the extension:

    npm start

## Development in Chrome

* Open Chrome
* Go to Window > Extensions
* Tick the box for Developer mode
* Click 'Load unpacked extension...'
* Select the `extension` folder

Anytime you edit the source code it will automatically reload in Firefox.
You may have to press command-R to reload it in Chrome depending on what you
changed.

### The remote control bit

* View the remote control page by opening
  `remote-control/index.html` in a browser
* Deploy a new version by typing `npm run push-remote`
