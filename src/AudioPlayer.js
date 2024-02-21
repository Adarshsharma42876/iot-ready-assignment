import React, { useState, useEffect, useRef } from "react";

const AudioPlayer = () => {
  const [audioFiles, setAudioFiles] = useState([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [audioURLs, setAudioURLs] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // Track current playback time
  const audioPlayerRef = useRef(null);
  const progressBarRef = useRef(null); // Reference to the progress bar element

  const handleFileUpload = (e) => {
    const newAudioFiles = [...audioFiles, ...e.target.files];
    setAudioFiles(newAudioFiles);
    localStorage.setItem("audioFiles", JSON.stringify(newAudioFiles));

    const urls = newAudioFiles.map((file) => {
      if (file instanceof File || file instanceof Blob) {
        return URL.createObjectURL(file);
      }
      return null;
    });

    setAudioURLs(urls);
  };

  const handleReset = () => {
    if (isPlaying) {
      audioPlayerRef.current.pause(); // Pause the audio if it's playing
      setIsPlaying(false);
    }
    setAudioFiles([]);
    setAudioURLs([]);
    setCurrentTrackIndex(0);
    localStorage.removeItem("audioFiles");
    localStorage.removeItem("currentTrackIndex");
  };

  useEffect(() => {
    // Load stored audio files from local storage
    const storedAudioFiles = JSON.parse(localStorage.getItem("audioFiles"));
    if (storedAudioFiles && Array.isArray(storedAudioFiles)) {
      setAudioFiles(storedAudioFiles);
      const urls = storedAudioFiles.map((file) => {
        if (file instanceof File || file instanceof Blob) {
          return URL.createObjectURL(file);
        }
        return null;
      });
      setAudioURLs(urls.filter((url) => url !== null));
    }

    // Load last playing audio file index from local storage
    const storedCurrentTrackIndex = localStorage.getItem("currentTrackIndex");
    if (storedCurrentTrackIndex !== null) {
      setCurrentTrackIndex(parseInt(storedCurrentTrackIndex));
    }
  }, []);

  useEffect(() => {
    // Save current track index to local storage
    localStorage.setItem("currentTrackIndex", currentTrackIndex.toString());
  }, [currentTrackIndex, audioFiles]);

  useEffect(() => {
    // Update audio element source when current track index changes
    if (audioPlayerRef.current && audioURLs[currentTrackIndex]) {
      audioPlayerRef.current.src = audioURLs[currentTrackIndex];
      if (isPlaying) {
        audioPlayerRef.current.play();
      }
    }
  }, [currentTrackIndex, audioURLs, isPlaying]);

  useEffect(() => {
    // Update the current time when the audio playback time changes
    const updateCurrentTime = () => {
      setCurrentTime(audioPlayerRef.current.currentTime);
    };
    if (audioPlayerRef.current) {
      audioPlayerRef.current.addEventListener("timeupdate", updateCurrentTime);
    }
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.removeEventListener(
          "timeupdate",
          updateCurrentTime
        );
      }
    };
  }, []);

  const handlePlay = (index) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    if (currentTrackIndex < audioFiles.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      setCurrentTrackIndex(0); // Loop back to the first track
    }
  };

  const handleProgressBarClick = (e) => {
    const progressBarRect = progressBarRef.current.getBoundingClientRect();
    const offsetX = e.clientX - progressBarRect.left;
    const percentage = offsetX / progressBarRef.current.offsetWidth;
    const newTime = percentage * audioPlayerRef.current.duration;
    setCurrentTime(newTime);
    audioPlayerRef.current.currentTime = newTime;
  };

  return (
    <div>
      <input
        type="file"
        accept="audio/mp3"
        onChange={handleFileUpload}
        multiple
      />
      <h2>Playlist</h2>
      <div className="play">
        <ul>
          {audioFiles.map((file, index) => (
            <li key={index} onClick={() => handlePlay(index)}>
              <button>Play</button>
              {file && file.name}
              {index === currentTrackIndex && <span> (Now Playing)</span>}
            </li>
          ))}
        </ul>
      </div>
      <audio
        ref={audioPlayerRef}
        id="audioPlayer"
        controls
        onEnded={handleEnded}
        onPause={() => setIsPlaying(false)}
      ></audio>
      <div
        ref={progressBarRef}
        id="progressBar"
        onClick={handleProgressBarClick}
        style={{ width: "100%", backgroundColor: "#ccc", cursor: "pointer" }}
      ></div>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default AudioPlayer;
