import React from 'react';
import ReactDOM from 'react-dom';

import firebase from './lib/firebase';

class RemoteControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
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
    return this.db.ref(`v1/${code}/connection`).once('value')
      .then(snapshot => {
        const message = snapshot.val();
        console.log('remote: connection message:', message);
        // Just check that the connection has a heartbeat.
        if (message && message.heartbeat) {
          // TODO: maybe check the timestamp of the heartbeat.
          return;
        } else {
          throw new Error(`Code ${code} is invalid`);
        }
      })
      .then(() => {
        // TODO: make this listener diconnectable (for removal onDisconnect)
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

        this.setState({error: null, code});
      })
      .catch(error => {
        this.setState({error: error.toString()});
      });
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
    const {error, code} = this.state;
    let content;
    if (code) {
      content = this.renderMuteControl();
    } else {
      content = this.renderEnterCode();
    }
    return (
      <div>
        {error ? <div className="error">{error}</div> : null}
        {content}
      </div>
    );
  }
}

ReactDOM.render(<RemoteControl/>, document.getElementById('app'));
