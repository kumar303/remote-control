import React from 'react';
import ReactDOM from 'react-dom';

class Popup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      code: null,
    };
  }

  componentDidMount() {
    console.log('popup: componentDidMount()');
    this.sendToBackground({action: 'getCode'})
      .then(message => {
        const code = message.data;
        this.setState({code});
      });
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

  render() {
    const {code} = this.state;
    return (
      <div>
        {code ? code : 'Waiting for code...'}
      </div>
    );
  }
}

ReactDOM.render(<Popup/>, document.getElementById('app'));
