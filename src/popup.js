import React from 'react';
import ReactDOM from 'react-dom';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOn: false,
      code: null,
    };
  }

  componentDidMount() {
    console.log('popup: componentDidMount()');

    this.getStatus();
  }

  sendToBackground(message) {
    const id = undefined;
    const options = undefined;
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        id,
        {
          background: true,
          ...message,
        },
        options,
        (result) => {
          if (chrome.runtime.lastError) {
            console.log(
              'popup: ignoring sendMessage error:',
              chrome.runtime.lastError);
          } else {
            resolve(result);
          }
        }
      );
    });
  }

  getStatus() {
    this.sendToBackground({action: 'getStatus'})
      .then(message => {
        const {isOn} = message.data;
        return {isOn};
      })
      .then(({isOn}) => {
        if (isOn) {
          return this.sendToBackground({action: 'getCode'})
            .then(message => {
              const code = message.data;
              return {isOn, code};
            })
        }
        return {isOn};
      })
      .then(state => {
        this.setState(state);
      });
  }

  toggleOnOff = (event) => {
    event.preventDefault();
    this.sendToBackground({action: 'toggleOnOff'})
      .then(() => this.getStatus());
  }

  render() {
    const {isOn, code} = this.state;
    let content;

    if (isOn) {
      content = (
        <div>
          <p>Go to <b>bit.ly/rem-c</b> and enter:</p>
          <code>{code ? code : 'Waiting for code...'}</code>
        </div>
      );
    } else {
      content = <p>The remote control is currently deactivated</p>;
    }


    const onOffPrompt = isOn ? 'Turn off the remote' : 'Turn on the remote';
    return (
      <div>
        {content}
        <footer>
          <button onClick={this.toggleOnOff}>{onOffPrompt}</button>
        </footer>
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
