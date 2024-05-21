import Home from '../Home';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function Test() {

    const { value } = useParams();

    const [email, title] = value.split('&&');

    const [testQuestions, setTestQuestions] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState('');

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

    const handleOptionClick = (answer, option) => {
        if (selectedAnswers === answer && selectedAnswers === option) {
            return true;
        } else {
            return false;
        }
    }

    
    return (
        <div>
            <Home />
            <h1>Test</h1>
            <div>
                <h2>Test Questions</h2>
                {testQuestions?.map((eachQ, index) => (
                    <div key={index}>
                        <h3 style={{
                            border: '1px solid black',
                            backgroundColor: 'lightblue',
                            width: '250px',
                            margin: '10px auto',
                            padding: '10px'
                        }}>
                            {eachQ.question}
                        </h3>
                        <ul>
                        {/* Map the options with styling and turn the color to green if the selected option matches with the answer otherwise turn the color to red */}
                            {eachQ.options.map((option, index) => (
                                <li key={index} style={{
                                    border: '1px solid black',
                                    backgroundColor: selectedAnswers ? handleOptionClick(eachQ.answer, option) ? 'green' : 'red' : 'white',
                                    width: '250px',
                                    margin: '10px auto',
                                    padding: '10px'
                                }}>
                                    {option}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}
