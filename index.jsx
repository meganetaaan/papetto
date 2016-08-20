import * as React from 'react';
import {Flux, Component} from 'flumpt';
import {render} from 'react-dom';

class Face extends Component {
  render() {
    const pos = {x: 10, y: 10, w: 250, h: 250};
    return <svg width={500} height={500}>
    <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} fill="#BBBBBB" />
    <Eye x={pos.x + pos.w / 2 - 50} y={pos.y + pos.h / 2 - 30} open={this.props.volume}/>
    <Eye x={pos.x + pos.w / 2 + 50} y={pos.y + pos.h / 2 - 30} open={this.props.volume}/>
    <Mouth x={pos.x + pos.w / 2 - 20} y={pos.y + pos.h / 2 + 30} open={this.props.volume}/>
    </svg>;
  }
}

class Eye extends Component {
  render() {
    const r = 10 * this.props.open + 10;
    return <circle cx={this.props.x} cy={this.props.y} r={r} fill="black" />;
  }
}

class Mouth extends Component {
  render() {
    const height = 100 * this.props.open;
    const width = 40;
    const x = this.props.x;
    const y = this.props.y - height / 2;
    return <rect x={x} y={y} height={height} width={width} />;
  }
}

class App extends Flux {
  render(state) {
    return <Face {...state}/>;
  }
}

// Setup renderer
const app = new App({
  renderer: el => {
    render(el, document.querySelector('#root'));
  },
  initialState: {volume: 0}
});

// TODO: 音量出力部分はコンポーネント切り出す
// first deal with browser prefixes
let getUserMedia = navigator.getUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.webkitGetUserMedia;
// make sure it's supported and bind to navigator
if (getUserMedia) {
  getUserMedia = getUserMedia.bind(navigator);
} else {
  // have to figure out how to handle the error somehow
}
// then deal with a weird, positional error handling API
const context = new AudioContext();
getUserMedia(
  // media constraints
  {video: true, audio: true},
  // success callback
  function (mediaStream) {
    const source = context.createMediaStreamSource(mediaStream);
    const analyserNode = context.createAnalyser();
    analyserNode.fftSize = 256;
    source.connect(analyserNode);


    // visualize frequency;
    const freqArray = new Uint8Array(analyserNode.frequencyBinCount);
    const draw = function() {
      analyserNode.getByteFrequencyData(freqArray);
      // clear path
      const volume = Math.max(...freqArray) / 256;
      app.update(() => ({volume}));
      requestAnimationFrame(draw);
    };
    draw();
  },
  // error callback
  function () {
    alert('error');
    // called if failed to get media
  }
);

app.update(_initialState => ({volume: 1}));// it fires rendering
