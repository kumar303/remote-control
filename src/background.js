import firebase from './lib/firebase';

function isTabMuted(tab) {
  return tab.mutedInfo && tab.mutedInfo.muted;
}

class Connection {
  constructor({onDbValue}) {
    this.onDbValue = onDbValue;
    this.db = firebase.database();

    // TODO: replace Ls and Is?
    this.code = Math.random().toString(36).substr(2, 5).toLowerCase();
    console.log('background: starting new connection with code:', this.code);

    this.channel = `v1/${this.code}/muteAction`;
    this.db.ref(this.channel).on('value', this.onDbValue);

    chrome.tabs.onUpdated.addListener(this.onTabUpdated);
  }

  onTabUpdated = (tabId, changeInfo, tab) => {
    if (!tab.active) {
      return;
    }
    // TODO: ignore changeInfo that's not for mute/unmute
    const channel = `v1/${this.code}/muteInfo`;
    const isMuted = isTabMuted(tab);
    console.log('onTabUpdated: current tab is muted?', isMuted);
    return this.db.ref(channel).set({
      tabIsMuted: isMuted,
    });
  }

  getCode() {
    return this.code;
  }

  shutdown() {
    console.log('background: shutting down connection');
    this.db.ref(this.channel).off('value', this.onDbValue);
    chrome.tabs.onUpdated.removeListener(this.onTabUpdated);
  }
}

class Background {
  constructor() {
    this.connection = null;
    chrome.runtime.onMessage.addListener(this.onMessage);
  }

  onDbValue = (snapshot) => {
    const message = snapshot.val();
    if (!message) {
      return;
    }
    console.log('background: received message', message);
    if (message.toggleMute) {
      this.onToggleMute(message);
    }
  }

  onToggleMute(message) {
    console.log('toggling mute', message.toggleMute);

    return this.getActiveTab()
      .then(activeTab => {
        const isMuted = isTabMuted(activeTab);
        console.log('Current tab is muted?', isMuted);
        return this.updateTabs({active: true, muted: !isMuted});
      });
  }

  getActiveTab() {
    return this.queryTabs({active: true, currentWindow: true})
      .then(tabs => {
        const activeTab = tabs[0];
        return activeTab;
      });
  }

  onMessage = (message, sender, sendResponse) => {
    if (!message.background) {
      return;
    }
    console.log('Background: got message:', message);

    let readMessage;
    switch (message.action) {
      case 'getCode':
        readMessage = this.getCode();
        break;
      case 'getStatus':
        readMessage = this.getStatus();
        break;
      case 'toggleOnOff':
        readMessage = this.toggleOnOff();
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
  }

  toggleOnOff() {
    return this.getStatus()
      .then(({data}) => {
        const status = data;
        if (status.isOn) {
          this.connection.shutdown();
          this.connection = null;
        } else {
          this.connection = new Connection({
            onDbValue: this.onDbValue,
          });
        }
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

  getStatus() {
    return Promise.resolve({
      data: {
        isOn: Boolean(this.connection),
      },
    });
  }

  getCode() {
    return Promise.resolve({data: this.connection.getCode()});
  }

  listen() {
    console.log('background: it is alive');
  }
}

const background = new Background();
background.listen();
