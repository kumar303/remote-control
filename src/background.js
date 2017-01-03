import firebase from './lib/firebase';

class Background {
  constructor() {
    this.db = firebase.database();
    console.log('background', this.db);

    // TODO: replace Ls and Is?
    this.code = Math.random().toString(36).substr(2, 5).toLowerCase();
    console.log('background: code', this.code);

    const channel = `v1/${this.code}/muteAction`;
    this.db.ref(channel).on('value', (snapshot) => {
      const message = snapshot.val();
      if (!message) {
        return;
      }
      console.log(`background: received message on channel ${channel}`,
                  message);
      if (message.toggleMute) {
        this.onToggleMute(message);
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

  isTabMuted(tab) {
    return tab.mutedInfo && tab.mutedInfo.muted;
  }

  getActiveTab() {
    return this.queryTabs({active: true})
      .then(tabs => {
        const activeTab = tabs[0];
        return activeTab;
      });
  }

  onToggleMute(message) {
    console.log('toggling mute', message.toggleMute);

    return this.getActiveTab()
      .then(activeTab => {
        const isMuted = this.isTabMuted(activeTab);
        console.log('Current tab is muted?', isMuted);
        return this.updateTabs({active: true, muted: !isMuted});
      })
      .then(() => this.getActiveTab())
      .then(activeTab => {
        const channel = `v1/${this.code}/muteInfo`;
        return this.db.ref(channel).set({
          tabIsMuted: this.isTabMuted(activeTab),
        });
      });
  }

  updateTabs(...args) {
    return new Promise((resolve, reject) => {
      chrome.tabs.update(...args, result => {
        if (chrome.runtime.lastError) {
          console.error(
            `background: updateTabs: error:`, chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        resolve(result);
      });
    });
  }

  queryTabs(query) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query(query, tabs => {
        if (chrome.runtime.lastError) {
          console.error(
            `background: queryTabs: error:`, chrome.runtime.lastError);
          return reject(chrome.runtime.lastError);
        }
        resolve(tabs);
      });
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
