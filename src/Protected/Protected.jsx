import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// import { auth } from '../config/firebase';

export default function Protected(props) {
    const { Component } = props;

    const navigate = useNavigate();

    useEffect(()=>{
        let login = localStorage.getItem('user');

        if (!login) {
            navigate('/login');
        }
    })

    return (
        <div>
            <Component />
        </div>
    )
}
