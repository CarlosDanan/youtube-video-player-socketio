import React, { useState, useRef, useEffect } from 'react';
import ProgressBarNumbers from './ProgressBarNumbers';
import './App.css';
import socketIO from 'socket.io-client';
const socket = socketIO.connect('http://localhost:4000');


function App() {
  const [youtubeId, setYoutubeId] = useState('');
  const [inputString, setInputString] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTime, setVideoTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [count, setCount] = useState(0);
  const [titleReady, setTitleReady] = useState(false);
  const apiKey = 'AIzaSyCuZ9KpPcQs1Oq8ntiNadJdrFX61krPJFI';
  const videoRef = useRef(null);
  const countString = (count - 1).toString();

  useEffect(() => {
    socket.on('info-ready', (title, seconds) => {
      setVideoTitle(title)
      setVideoTime(seconds)
      setTitleReady(true);
    });
    socket.on('video-ready', (ready) => {
      if (ready) {
        setReady(true);
      }
    });
  })

  const handleSetInputString = (e) => {
    setInputString(e.target.value);
  }

  const handleGetYoutubeVideo = async () => {
    setReady(false);
    setTitleReady(false);
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = inputString.match(regExp);
    let videoId = (match && match[7].length == 11) ? match[7] : false;
    socket.emit('download', videoId, count)
    setCount(count + 1)
  }

  const fastForward = () => {
    videoRef.current.currentTime += 5;
  };

  const revert = () => {
    videoRef.current.currentTime -= 5;
  };

  const videoHandler = (control) => {
    if (control === "play") {
      videoRef.current.play();
      setPlaying(true);
      var vid = document.getElementById("video1");
    } else if (control === "pause") {
      videoRef.current.pause();
    }
  };
  if (ready) {
    window.setInterval(function () {
      setCurrentTime(videoRef.current?.currentTime);
      setProgress((videoRef.current?.currentTime / videoTime) * 100);

    }, 2000);
  }
  return (
    <div className="app">
      <div>
        <div className='input-container' >
          <h4>YoutubeUrl</h4>
          <input className='url-input' type="text" onChange={handleSetInputString} value={inputString} />
          <button onClick={handleGetYoutubeVideo}>Get Video</button>
        </div>
      </div>
      {titleReady &&
        <h1>Title:{videoTitle}</h1>
      }
      {ready &&
        <div className='player' >
          <video id="video1" ref={videoRef} className="video" >
            <source src={'http://localhost:4000/get_video/' + countString} type="video/mp4"></source>
          </video>
          <div className="timecontrols">
            <ProgressBarNumbers seconds={currentTime} />
            <div className="time_progressbarContainer">
              <div style={{ width: ready ? progress + "%" : '0' }} className="time_progressBar"></div>
            </div>
            <ProgressBarNumbers seconds={videoTime} />
          </div>
          <div className="controlsContainer">
            <div className="controls">
              <div>
                <button onClick={() => revert()} ><strong>Revert</strong></button>
              </div>
              <div>
                <button onClick={() => videoHandler("play")} ><strong>Play</strong></button>
              </div>
              <div>
                <button onClick={() => videoHandler("pause")} ><strong>Pause</strong></button>
              </div>
              <div>
                <button onClick={() => fastForward()} ><strong>Forward</strong></button>
              </div>
            </div>
          </div>
        </div>
      }


    </div>
  );
}
export default App;