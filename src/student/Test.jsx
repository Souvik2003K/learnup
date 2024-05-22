import Home from '../Home';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function Test() {

    const { value } = useParams();
    const navigate = useNavigate();

    const [email, title] = value.split('&&');

    const [testQuestions, setTestQuestions] = useState([]);
    // const [selectedAnswers, setSelectedAnswers] = useState('');

    useEffect(() => {
        axios.get(import.meta.env.VITE_QUIZ_SHOW_API)
        .then(response => {
            const filteredData = response.data.data.filter(item => item.uploader === email && item.course === title);
            const quizQuestions = filteredData.flatMap(item => item.Quiz);
            setTestQuestions(quizQuestions);
        }).catch(error => {
            console.error('Error:', error);
        });
    }, []);


    const [selectedAnswers, setSelectedAnswers] = useState(
        Array(testQuestions.length).fill('')
    );

    const [score, setScore] = useState(0);

    const handleOptionClick = (questionIndex, answer, option) => {
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[questionIndex] = option;
        setSelectedAnswers(updatedAnswers);

        // Increase the score if the selected option is correct
        if (option == answer) {
            setScore(prevScore => prevScore += 1);
        }
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
                <h2 className='text-2xl text-center my-3'>Quiz on <strong>{title}</strong></h2>
                {testQuestions?.map((eachQ, index) => (
                    <div key={index}>
                        <h3 style={{
                            // border: '1px solid black',
                            // backgroundColor: 'lightblue',
                            // width: '30%',
                            fontSize: '20px',
                            fontWeight: 600,
                            margin: '10px auto',
                            padding: '10px'
                        }}
                        className='w-5/6 lg:w-2/6'
                        >
                            {index+1}. {eachQ.question} ?
                        </h3>
                        <ul>
                        {/* Map the options with styling and turn the color to green if the selected option matches with the answer otherwise turn the color to red */}
                        {eachQ.options.map((option, index) => (
                            <li
                                key={index}
                                style={{
                                    border: '1px solid black',
                                    // width: '30%',
                                    margin: '10px auto',
                                    padding: '10px',
                                    cursor: 'pointer',
                                    backgroundColor: 
                                        selectedAnswers[index] === option 
                                            ? (option === eachQ.answer ? 'lightgreen' : 'lightcoral') 
                                            : 'white',
                                }}
                                className='w-5/6 lg:w-2/6'
                                onClick={() => handleOptionClick(index, eachQ.answer, option)}
                            >
                                {option}
                            </li>
                        ))}
                        </ul>
                    </div>
                ))}
                {/* <button onClick={submit}>Submit</button> */}
                <div className='flex justify-center my-3'>
                    <button className="flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-700 text-white px-4 py-2 mt-4 rounded-lg transition duration-300 text-lg" 
                    onClick={submit}
                    >Submit</button>
                </div>
            </div>
        </div>
    )
}
