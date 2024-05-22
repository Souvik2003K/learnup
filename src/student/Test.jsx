import Home from '../Home';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Test() {

    const { value } = useParams();
    const navigate = useNavigate();

    const [email, title] = value.split('&&');

    const [testQuestions, setTestQuestions] = useState([]);

    useEffect(() => {
        axios.get(import.meta.env.VITE_QUIZ_SHOW_API)
        .then(response => {
            console.log('got the data');
            console.log(response.data.data);
            console.log(email, title);
            const filteredData = response.data.data.filter(item => item.uploader === email && item.course === title);
            const quizQuestions = filteredData.flatMap(item => item.Quiz);
            setTestQuestions(quizQuestions);
        }).catch(error => {
            console.error('Error:', error);
        });
    }, []);


    const [selectedAnswers, setSelectedAnswers] = useState([]);

    const [score, setScore] = useState(0);

    const handleOptionClick = (questionIndex, answer, option) => {
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[questionIndex] = option;
        setSelectedAnswers(updatedAnswers);

        // Calculate the score correctly
        let newScore = 0;
        updatedAnswers.forEach((selectedOption, idx) => {
            if (selectedOption === testQuestions[idx]?.answer) {
                newScore += 1;
            }
        });
        setScore(newScore);
    };


    const submit = () => {
        if(score < testQuestions.length) {
            alert(`You didn't passed the test.\nYour score is ${score} out of ${testQuestions.length}`);
            navigate('/student');
        } else {
            alert(`You passed the test.\nYour score is ${score} out of ${testQuestions.length}`);
            navigate('/student');
        }
    }

    
    return (
        <div>
            <Home />
            <div>
                <p className='text-2xl text-center my-3 underline'>Quiz on <strong>{title}</strong></p>
                {testQuestions?.map((eachQ, Qindex) => (
                    <div key={Qindex}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: 600,
                            margin: '10px auto',
                            padding: '10px'
                        }}
                        className='w-5/6 lg:w-2/6'
                        >
                            {Qindex+1}. {eachQ.question} ?
                        </h3>
                        <ul>
                        {eachQ.options.map((option, Oindex) => (
                            <li
                                key={Oindex}
                                style={{
                                    border: '1px solid black',
                                    margin: '10px auto',
                                    padding: '10px',
                                    cursor: selectedAnswers[Qindex] ? 'not-allowed' : 'pointer',
                                    backgroundColor: 
                                        selectedAnswers[Qindex] === option 
                                            ? (option === eachQ.answer ? 'lightgreen' : 'lightcoral') 
                                            : 'white',
                                }}
                                className='w-5/6 lg:w-2/6'
                                onClick={() => handleOptionClick(Qindex, eachQ.answer, option)}
                            >
                                {option}
                            </li>
                        ))}
                        </ul>
                    </div>
                ))}
                <div className='flex justify-center my-3'>
                    <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 text-lg" 
                    onClick={submit}
                    >Submit</button>
                </div>
            </div>
        </div>
    )
}
