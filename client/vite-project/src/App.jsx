import React, { useState, useRef } from 'react';
import ProgressBarNumbers from './ProgressBarNumbers';
import './App.css';

function App() {
  const [youtubeId, setYoutubeId] = useState('');
  const [inputString, setInputString] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTime, setVideoTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const apiKey = 'AIzaSyCuZ9KpPcQs1Oq8ntiNadJdrFX61krPJFI';
  const videoRef = useRef(null);


  const handleSetInputString = (e) => {
    setInputString(e.target.value);
  }

  const handleGetYoutubeVideo = async () => {
    let regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    let match = inputString.match(regExp);
    let videoId = (match && match[7].length == 11) ? match[7] : false;
    if (videoId != false) {
      setYoutubeId(videoId)
      console.log(videoId)
      fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + videoId + "&key=" + apiKey)
        .then(res => res.json())
        .then(
          (result) => {
            setVideoTitle(result.items[0].snippet.title);
          }
        )
      await fetch('http://localhost:4000/get-video-info/' + videoId, {
        mode: 'no-cors',
      }).catch(function (error) {
        console.log(error);
      });
    }
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
      setVideoTime(vid.duration);
    } else if (control === "pause") {
      videoRef.current.pause();
    }
  };
  window.setInterval(function () {
    setCurrentTime(videoRef.current?.currentTime);
    setProgress((videoRef.current?.currentTime / videoTime) * 100);
  }, 1000);
  return (
    <div className="app">
      <div>
        <div className='input-container' >
          <h4>YoutubeUrl</h4>
          <input className='url-input' type="text" onChange={handleSetInputString} value={inputString} />
          <button onClick={handleGetYoutubeVideo}>Get Video</button>
        </div>
      </div>
      <h1>Title:{videoTitle}</h1>
      <video id="video1" ref={videoRef} className="video" >
        <source src='http://localhost:4000/get_video' type="video/mp4"></source>
      </video>
      <div className="timecontrols">
        <ProgressBarNumbers seconds={currentTime} />
        <div className="time_progressbarContainer">
          <div style={{ width: toString(progress) + "%" }} className="time_progressBar"></div>
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
  );
}
export default App;