import React, { Component } from 'react';
import moment from 'moment';

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
      hour: parseInt(moment().format('HH'), 10),
      minute: parseInt(moment().format('mm'), 10)
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

    closingIn = Math.floor(
      (moment()
        .set('hour', closing.hour)
        .set('minute', closing.minute)
        .unix() -
        moment().unix()) /
        60
    );

    isOpen = closingIn > 0;
  } else {
    isOpen = false;
  }

  return { isOpen, closingIn };
};

const days = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

class App extends Component {
  state = {
    canteens: {},
    open: -1
  };

  componentDidMount() {
    this.setState({ canteens });
  }

  renderOpen({ isOpen, closingIn }) {
    if (!isOpen) {
      // return <div>Closed</div>;
    }
    if (closingIn < 60) {
      return <div>{`Closing in ${closingIn} minutes`}</div>;
    }
    // return <div>Open</div>;
  }

  render() {
    const day = (moment().day() + 6) % 7;
    const { canteens } = this.state;

    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title" style={{ fontWeight: '100' }}>
            &gt; cantee.nu
          </h1>
        </header>
        <div className="list">
          {Object.keys(canteens)
            .sort()
            .map((canteen, index) => (
              <div
                className="canteen-card"
                key={canteen}
                onClick={() =>
                  this.setState({
                    open: this.state.open === index ? -1 : index
                  })
                }
              >
                <div className="canteen-header">
                  <div
                    className="canteen-status"
                    style={{
                      background: getOpen(canteens[canteen][day]).isOpen
                        ? getOpen(canteens[canteen][day]).closingIn < 60
                          ? '#dd2'
                          : '#2d2'
                        : '#d22'
                    }}
                  />
                  <div className="canteen-title">
                    <h3>{canteen}</h3>
                  </div>
                </div>
                {this.state.open !== index &&
                  this.renderOpen(getOpen(canteens[canteen][day]))}
                {this.state.open === index && (
                  <div>
                    {canteens[canteen].map((hours, index) => (
                      <div
                        style={{
                          display: 'flex'
                        }}
                      >
                        <div
                          className="weekday"
                          style={{
                            fontWeight: day === index ? 'bold' : 'normal'
                          }}
                        >
                          {days[index]}
                        </div>
                        <div
                          key={`${canteen}day${index}`}
                          className="hours"
                          style={{
                            fontWeight: day === index ? 'bold' : 'normal'
                          }}
                        >
                          {hours.length ? formatHours(hours) : 'Closed'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    );
  }
}

// dan chet beyoo nanee
export default App;
