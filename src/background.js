import firebase from './lib/firebase';

class Background {
  constructor() {
    const db = firebase.database();
    console.log('background', db);

    this.code = Math.random().toString(36).substr(2, 5).toLowerCase();
    console.log('background: code', this.code);

    const channel = `v1/${this.code}`;
    db.ref(channel).on('value', (snapshot) => {
      const message = snapshot.val();
      if (!message) {
        return;
      }
      console.log(`Received message in ${channel}`, message);
      if (message.action && message.action === 'mute') {
        console.log('toggling mute');

        chrome.tabs.update({active: true, muted: true}, () => {
          if (chrome.runtime.lastError) {
            console.log(
              `background: mute: error:`, chrome.runtime.lastError);
            return;
          }

          //this.db.ref(`v1/${this.code}`).set({
          //  tabState: 'muted';
          //});

        });
      }
    });

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (!message.background) {
        return;
      }
      console.log('Background: got message:', message);

      let readMessage;
      switch (message.action) {
        case 'getCode':
          readMessage = this.getCode();
          break;
        default:
          throw new Error(
            `Background got an unexpected action: ${message.action}`);
      }

      readMessage.then(reply => sendResponse(reply))
        .catch(error => {
          console.error('Background: error reading message', error);
        });

      return true;
    });
  }

  getCode() {
    return Promise.resolve({data: this.code});
  }

  listen() {
    console.log('background: it is alive');
  }
}

const background = new Background();
background.listen();
