"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { NextPage } from "next";

// Impor ikon untuk musik
import { MdPlayCircleFilled, MdStopCircle } from "react-icons/md";
// Impor ikon untuk mode gelap
import { BsSunFill, BsMoonFill } from "react-icons/bs";
// Impor ikon CD
import { FaCompactDisc } from "react-icons/fa";

const POMODORO_TIME = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK = 15 * 60;
const POMODORO_SESSIONS = 4;

// Path ke file suara lokal
const SOUND_FILES = [
  "/sounds/bell01.mp3",
  "/sounds/bell02.mp3",
  "/sounds/bell03.mp3",
];

// Path ke file musik lokal
const MUSIC_FILES = [
  "/music/berharap_kau_kembali.mp3",
  "/music/kau_ciri_lagi.mp3",
];

const Home: NextPage = () => {
  const [time, setTime] = useState<number>(POMODORO_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isBreak, setIsBreak] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  const [musicDuration, setMusicDuration] = useState<number>(0);
  const [musicCurrentTime, setMusicCurrentTime] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (time === 0) {
      setIsRunning(false);

      const randomSoundIndex = Math.floor(Math.random() * SOUND_FILES.length);
      const audio = new Audio(SOUND_FILES[randomSoundIndex]);
      audio.play().catch((error) => {
        console.error("Autoplay was prevented:", error);
      });

      if (isBreak) {
        setIsBreak(false);
        setTime(POMODORO_TIME);
      } else {
        setPomodoroCount((prevCount) => prevCount + 1);
        setIsBreak(true);

        if ((pomodoroCount + 1) % POMODORO_SESSIONS === 0) {
          setTime(LONG_BREAK);
        } else {
          setTime(SHORT_BREAK);
        }
      }
    }
  }, [time, isBreak, pomodoroCount]);

  useEffect(() => {
    if (isMusicPlaying && audioRef.current) {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
      }
      musicIntervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setMusicCurrentTime(audioRef.current.currentTime);
        }
      }, 1000);
    } else {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
      }
      setMusicCurrentTime(0);
      setMusicDuration(0);
    }

    return () => {
      if (musicIntervalRef.current) {
        clearInterval(musicIntervalRef.current);
      }
    };
  }, [isMusicPlaying]);

  const handleStartPause = (): void => {
    setIsRunning(!isRunning);
  };

  const handleReset = (): void => {
    setIsRunning(false);
    setIsBreak(false);
    setTime(POMODORO_TIME);
    setPomodoroCount(0);
    if (isMusicPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  };

  const handleThemeToggle = (): void => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.className = newMode ? "dark" : "";
  };

  const handlePlayMusic = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const randomMusicIndex = Math.floor(Math.random() * MUSIC_FILES.length);
    audioRef.current = new Audio(MUSIC_FILES[randomMusicIndex]);
    audioRef.current.loop = true;

    audioRef.current.onloadedmetadata = () => {
      if (audioRef.current) {
        setMusicDuration(audioRef.current.duration);
      }
    };

    audioRef.current.play().catch((error) => {
      console.error("Failed to play music:", error);
    });
    setIsMusicPlaying(true);
  };

  const handleStopMusic = (): void => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsMusicPlaying(false);
  };

  const currentMode = isBreak ? "Istirahat" : "Fokus";
  const currentSessionText = `Sesi: ${pomodoroCount + 1}/${POMODORO_SESSIONS}`;
  const isTimeLow = time <= 10 && time > 0;

  const totalTime = isBreak
    ? (pomodoroCount + 1) % POMODORO_SESSIONS === 0
      ? LONG_BREAK
      : SHORT_BREAK
    : POMODORO_TIME;
  const progressDegree = (time / totalTime) * 360;

  const lightModeColors = {
    bg: "bg-gradient-to-br from-sky-100 via-cyan-100 to-blue-200",
    main: "bg-white text-slate-800 shadow-xl",
    title: "text-slate-800",
    modeText: "text-slate-600",
    sessionText: "text-slate-400",
    ring: isBreak
      ? { from: "#34d399", to: "#06b6d4" }
      : { from: "#0ea5e9", to: "#60a5fa" },
    timerText: isBreak ? "text-emerald-500" : "text-blue-500",
    buttons: {
      start: "bg-blue-500 hover:bg-blue-600",
      reset: "bg-slate-400 hover:bg-slate-500",
    },
  };

  const darkModeColors = {
    bg: "dark:bg-gradient-to-br dark:from-blue-950 dark:via-slate-950 dark:to-indigo-950",
    main: "dark:bg-slate-800 dark:text-gray-200 dark:shadow-2xl",
    title: "dark:text-gray-100",
    modeText: "dark:text-gray-300",
    sessionText: "dark:text-gray-500",
    ring: isBreak
      ? { from: "#34d399", to: "#06b6d4" }
      : { from: "#a78bfa", to: "#4fd1c5" },
    timerText: isBreak ? "dark:text-emerald-300" : "dark:text-blue-300",
    buttons: {
      start: "dark:bg-blue-700 dark:hover:bg-blue-800",
      reset: "dark:bg-slate-600 dark:hover:bg-slate-700",
    },
  };

  const currentColors = isDarkMode ? darkModeColors : lightModeColors;

  return (
    <div
      className={`
      flex justify-center items-center min-h-screen font-sans text-center transition-all duration-500
      ${lightModeColors.bg} ${darkModeColors.bg}
    `}
    >
      <Head>
        <title>Tepang Waktos</title>
        <meta
          name="description"
          content="A simple Pomodoro timer built with Next.js"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main
        className={`
        p-10 rounded-2xl ${lightModeColors.main}
        ${darkModeColors.main} transition-all duration-500 flex flex-col justify-center items-center relative
      `}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={handleThemeToggle}
            className="text-xl text-gray-800 dark:text-gray-200 transition-transform hover:scale-110"
          >
            {isDarkMode ? <BsSunFill /> : <BsMoonFill />}
          </button>
        </div>

        <h1
          className={`text-4xl font-bold font-sans mb-2 ${lightModeColors.title} ${darkModeColors.title}`}
        >
          Tepang Waktos
        </h1>
        <p
          className={`text-lg mb-4 ${lightModeColors.modeText} ${darkModeColors.modeText}`}
        >
          {currentMode}
        </p>

        <div
          className="timer-ring mb-8"
          style={
            {
              "--ring-degree": `${progressDegree}deg`,
              "--ring-from-color": currentColors.ring.from,
              "--ring-to-color": currentColors.ring.to,
            } as React.CSSProperties
          }
        >
          <div className="timer-ring-inner">
            <p
              className={`text-sm ${lightModeColors.sessionText} ${darkModeColors.sessionText}`}
            >
              {currentSessionText}
            </p>
            <div
              className={`
                text-7xl font-bold font-inter
                ${currentColors.timerText}
                ${isTimeLow ? "animate-pulse" : ""}
              `}
            >
              {formatTime(time)}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center mt-2">
          <button
            onClick={handleStartPause}
            className={`
              px-8 py-3 text-lg font-semibold rounded-lg text-white
              transition-transform duration-200
              ${currentColors.buttons.start}
              hover:scale-105 active:scale-95
            `}
          >
            {isRunning ? "Jeda" : "Mulai"}
          </button>
          <button
            onClick={handleReset}
            className={`
              px-8 py-3 text-lg font-semibold rounded-lg text-white
              transition-transform duration-200
              ${currentColors.buttons.reset}
              hover:scale-105 active:scale-95
            `}
          >
            Reset
          </button>
        </div>
      </main>

      <div
        className={`
          fixed bottom-4 right-4 z-50
          p-3 rounded-xl shadow-lg
          flex flex-col items-center gap-3 transition-all duration-300
          bg-white dark:bg-slate-800
        `}
      >
        {isMusicPlaying && (
          <FaCompactDisc
            className={`
              text-4xl text-gray-400 dark:text-gray-500
              animate-spin
            `}
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={handlePlayMusic}
            disabled={isMusicPlaying}
            className={`
              p-2 rounded-full text-4xl text-emerald-500 hover:text-emerald-600
              transition-transform duration-200
              hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              dark:text-emerald-300 dark:hover:text-emerald-400
            `}
          >
            <MdPlayCircleFilled />
          </button>
          <button
            onClick={handleStopMusic}
            disabled={!isMusicPlaying}
            className={`
              p-2 rounded-full text-4xl text-rose-500 hover:text-rose-600
              transition-transform duration-200
              hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              dark:text-rose-300 dark:hover:text-rose-400
            `}
          >
            <MdStopCircle />
          </button>
        </div>

        {isMusicPlaying && !isNaN(musicDuration) && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {formatTime(musicCurrentTime)} / {formatTime(musicDuration)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
