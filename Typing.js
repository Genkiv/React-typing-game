import { useEffect, useRef, useState } from "react";
const RANDOM_SENTENCE_URL_API = "/api/random";


export default function Typing(){
    
    const [sentence, setSentence] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [score, setScore] = useState(0);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] =  useState(false);
    const inputRef = useRef(null);

    // タイマー機能
    const time = 30;
    const longTime = 120;
    const [timer, setTimer] = useState(time);
    const [startTime, setStartTime] = useState(null);
    const intervalId = useRef(null);
    const [longTimer, setLongTimer] = useState(longTime);
    const [longStartTime, setLongStartTime] = useState(null);
    const longIntervalId = useRef(null);

    
    // 音声機能
    const typeSound = useRef(new Audio("/music/typing-sound.mp3"));
    const wrongSound = useRef(new Audio("/music/wrong.mp3"));
    const correctSound = useRef(new Audio("/music/correct.mp3"));
    const quizSound = useRef(new Audio("/music/quiz.mp3"));
    const finishSound = useRef(new Audio("/music/finish-sound.mp3"));
    
    
    // 文章のランダム表示
    const getRandomSentence = async () =>{
        const response = await fetch(RANDOM_SENTENCE_URL_API);
        const sentence= await response.json();
        setSentence(sentence[0].q);
        setInputValue("");
        setTimer(time);
        setStartTime(Date.now());

        
    };

    // 30秒タイマー開始、終了
    useEffect(() => {
        if(startTime == null) return;

        intervalId.current = setInterval(() => {
            const second = Math.floor((Date.now() - startTime) / 1000);
            setTimer(time - second);
        },1000);

        return () => clearInterval(intervalId.current);
    },[startTime]);

    useEffect(() => {
        if(timer <= 0) {
            clearInterval(intervalId.current);
            getRandomSentence();
            const quiz = quizSound.current;
            quiz.currentTime = 0;
            quiz.play();
        }
    },[timer]);

    useEffect(() => {
        if(longStartTime == null) return;

        longIntervalId.current = setInterval(() => {
            const  longSecond = Math.floor((Date.now() - longStartTime) / 1000);
            setLongTimer(longTime - longSecond);
        }, 1000);

        return() => clearInterval(longIntervalId.current);
    },[longStartTime]);

    useEffect(() => {
    if (longTimer <= 0) {
        const finish = finishSound.current;
        finish.currentTime = 0;
        finish.play().catch((e) => {
        console.error("Finish sound play failed:", e);
        });
        clearInterval(intervalId.current);
        clearInterval(longIntervalId.current);
        setFinished(true);
        setStarted(false);
    }
    }, [longTimer]);


    const handleChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        const sound = typeSound.current;
        sound.currentTime = 0;
        sound.play().catch((e) => {
        console.error("Type sound play failed:", e);
        });
        const isCorrect = sentence.split("").every((char,index) => value[index] === char);

        if(value.length === sentence.length && isCorrect){
            setScore(prev => prev + value.length);
            const correct = correctSound.current;
            correct.currentTime = 0;
            correct.play().catch((e) => {
            console.error("Correct sound play failed:", e);
            });
            getRandomSentence();
            const quiz = quizSound.current;
            quiz.currentTime = 0;
            quiz.play().catch((e) => {
            console.error("Quiz sound play failed:", e);
            });
        }else if(value.length > 0 && value.length <= sentence.length && 
            value[value.length-1] !== sentence[value.length -1]){
            const wrong = wrongSound.current;
            wrong.volume = 0.3;
            wrong.currentTime = 0;
            wrong.play().catch((e) => {
            console.error("Wrong sound play failed:", e);
            });
        }
    };

    const handleClick = () => {
        setStarted(true);
        setFinished(false);
        setScore(0);
        
        const quiz = quizSound.current;
        quiz.currentTime = 0;
        quiz.play().catch((e) => {
        console.error("Quiz sound play failed:", e);
        });
        setLongStartTime(Date.now());
        getRandomSentence();
        setTimeout(() => {
        inputRef.current?.focus();
        }, 100);
    }

    return(
        <>
        <div className={`${finished ? "scoreDisplay" : "startDisplay"} ${started && !finished ? "hidden" : ""}`}>
            {finished ? <h2>SCORE : {score}</h2> : <h1>Typing Game</h1>} 
            <button type="button" className="startBtn" onClick={handleClick}>Game Start</button>

        </div>

        
        <div className={`gameBody ${started && !finished ? "" : "hidden"}`}>
            <div className="scorePanel">score : {score}</div>
            <div className="timer">{timer}</div>
            <div className="container">
            <div className="type-display">
                {sentence.split("").map((char,index) => {
                    let classList = "";
                    if(index < inputValue.length){
                        classList = char === inputValue[index] ? "correct" : "incorrect";
                    }
                    return(
                        <span key={index} className={classList}>
                            {char}
                        </span>
                    );
                })}
            </div>
            <textarea className="type-input" value={inputValue} onChange={handleChange} ref={inputRef}></textarea>
            </div>
        </div>
        </>
    );
}