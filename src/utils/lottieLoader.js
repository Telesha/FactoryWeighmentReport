import React, { Component, useEffect } from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import { makeStyles } from '@material-ui/core/styles';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import { ClassicSpinner } from "react-spinners-kit";
import { Grid } from '@material-ui/core';
import Lottie from 'react-lottie';
import animation from '../lotties/45869-farmers.json';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles(({ breakpoints, spacing }) => ({
    container: {
        textAlign: 'center',
        fontFamily: 'Nunito',
    },
    title: {
        fontSize: '2.5rem',
        color: '#34D509',
        fontFamily: 'Nunito',
    },
    colorText: {
        textAlign: 'center',
        color: '#4472c4',
        fontFamily: 'Nunito',
    },
    minititle: {
        fontSize: '1.2rem',
        color: '#002060'
    },
}));

export const LottieLoadingComponent = (props) => {
    const { promiseInProgress } = usePromiseTracker();
    const navigate = useNavigate();
    const classes = useStyles();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animation,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice"
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (sessionStorage.getItem('token') === "" || sessionStorage.getItem('token') == null || sessionStorage.getItem('token') === undefined) {

                navigate('/login ');
            } else {
                console.log("secure route")
                navigate('/app/dashboard');
            }
        }, 3000);
        return () => clearTimeout(timer);

    });

    return (
        <div style={{ marginTop: "15rem", alignContent: "center", justifyContent: "center", alignItems: "center", textAlign: "center" }}>


            <Lottie
                options={defaultOptions}
                height={300}
                width={300}
            />
            {/* <Grid className={classes.container}>
                        <h1 className={classes.title}>
                            Cultive
                            <span className={classes.colorText}>8</span>
                        </h1>
                         <p className={classes.minititle}>
                            beyond information modeling..
                        </p> 
                    </Grid> */}
            {/* <img style={{ width: 300, height: 120 }} src="/static/images/products/AgriGEN.png" alt="login" /> */}
        </div>
    );

};
