import React from 'react';
import ReactDOM from 'react-dom';

import firebase from './lib/firebase';

class RemoteControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
    };

    this.db = firebase.database();
  }

  onClick = (event) => {
    event.preventDefault();
    const {code} = this.state;

    this.db.ref(`v1/${code}`).set({
      action: 'mute',
    });
  }

  onEnterCodeChar = (event) => {
    event.preventDefault();
    const code = event.currentTarget.value;
    if (code.length === 5) {
      this.setState({code});
    }
  }

  render() {
    const {code} = this.state;
    let content;
    if (code) {
      content = <button onClick={this.onClick}>Mute</button>;
    } else {
      content = (
        <input
          onKeyUp={this.onEnterCodeChar}
          type="text" placeholder="Enter code" />
      );
    }
    return (
      <div>
        {content}
      </div>
    );
  }
}

ReactDOM.render(<RemoteControl/>, document.getElementById('app'));
