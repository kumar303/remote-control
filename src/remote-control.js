import React from 'react';
import ReactDOM from 'react-dom';

import firebase from './lib/firebase';

class RemoteControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
      tabIsMuted: false,
    };

    this.db = firebase.database();
  }

  onClick = (event) => {
    event.preventDefault();
    const {code} = this.state;

    const channel = `v1/${code}/muteAction`;
    console.log(`Asking channel ${channel} to toggle mute`);
    this.db.ref(channel).set({
      toggleMute: (new Date()).toString(),
    });
  }

  onEnterCodeChar = (event) => {
    event.preventDefault();
    const code = event.currentTarget.value;
    if (code.length === 5) {
      this.setCode(code);
    }
  }

  setCode(code) {
    const channel = `v1/${code}/muteInfo`;
    this.db.ref(channel).on('value', (snapshot) => {
      const message = snapshot.val();
      if (!message) {
        return;
      }
      console.log(`remote: received message on channel ${channel}`,
                  message);
      this.setState({tabIsMuted: message.tabIsMuted});
    });

    this.setState({code});
  }

  renderEnterCode() {
    return (
      <input
        onKeyUp={this.onEnterCodeChar}
        autocorrect="off" autocapitalize="off" spellcheck="false"
        autocomplete="off" type="text" placeholder="Enter code" />
    );
  }

  renderMuteControl() {
    const {tabIsMuted} = this.state;
    const label = tabIsMuted ? 'Unmute' : 'Mute';
    return <button onClick={this.onClick}>{label}</button>;
  }

  render() {
    const {code} = this.state;
    let content;
    if (code) {
      content = this.renderMuteControl();
    } else {
      content = this.renderEnterCode();
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}

ReactDOM.render(<RemoteControl/>, document.getElementById('app'));
