import React, { Component } from 'react';
import moment from 'moment';

import logo from './logo.svg';
import './App.css';

import canteens from './canteens.json';

const formatHours = hours =>
  `${hours.substring(0, 2)}:${hours.substring(2, 4)}-${hours.substring(
    5,
    7
  )}:${hours.substring(7, 9)}`;

const getOpen = hours => {
  let isOpen;
  let closingIn = 0;

  if (hours.length) {
    const now = {
      hour: parseInt(moment().format('HH')),
      minute: parseInt(moment().format('mm'))
    };
    const opening = {
      hour: parseInt(hours.substring(0, 2), 10),
      minute: parseInt(hours.substring(2, 4), 10)
    };
    const closing = {
      hour: parseInt(hours.substring(5, 7), 10),
      minute: parseInt(hours.substring(7, 9), 10)
    };

    console.log(now, opening, closing);

    isOpen =
      now.hour > opening.hour ||
      (now.hour === opening.hour &&
        now.minute >= opening.minute &&
        now.hour < closing.hour) ||
      (now.hour === closing.hour && now.minute < closing.minute);

    closingIn = Math.floor(
      (moment()
        .set('hour', closing.hour)
        .set('minute', closing.minute)
        .unix() -
        moment().unix()) /
        60
    );
  } else {
    isOpen = false;
  }

  return { isOpen, closingIn };
};

class App extends Component {
  state = {
    open: -1
  };

  renderOpen({ isOpen, closingIn }) {
    return <div>{isOpen ? 'Open' : 'Closed'}</div>;
  }

  render() {
    const day = (moment().day() + 6) % 7;

    console.log(day);

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title" style={{ fontWeight: '100' }}>
            &gt; cantee.nu
          </h1>
        </header>
        {Object.keys(canteens).map((canteen, index) => (
          <div
            className="canteen-card"
            key={canteen}
            onClick={() =>
              this.setState({ open: this.state.open === index ? -1 : index })
            }
          >
            <h3>{canteen}</h3>
            {this.state.open === index
              ? canteens[canteen].map((hours, index) => (
                  <div
                    key={`${canteen}day${index}`}
                    style={{ background: day === index ? '#0fd' : '#fff' }}
                  >
                    {hours.length ? formatHours(hours) : 'Closed'}
                  </div>
                ))
              : this.renderOpen(getOpen(canteens[canteen][day]))}
          </div>
        ))}
      </div>
    );
  }
}

// dan chet beyoo nanee
export default App;
