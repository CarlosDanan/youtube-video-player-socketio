import React from 'react';
import './App.css';

const ProgressBarNumbers = (props) => {
    const { seconds } = props;
    let us, ds, um, dm, uh, dh;
    us = Math.trunc(seconds % 10);
    ds = Math.trunc((seconds % 60) / 10);
    um = Math.trunc((seconds / 60) % 10);
    dm = Math.trunc((seconds / 600) % 10);
    uh = Math.trunc((seconds / 3600) % 10);
    dh = Math.trunc((seconds / 36000) % 10);

    return (
        <div className='progress-bar-nums' >
            <p>{dh}</p><p>{uh}:</p><p>{dm}</p><p>{um}:</p><p>{ds}</p><p>{us}</p>
        </div>
    );
}

export default ProgressBarNumbers;