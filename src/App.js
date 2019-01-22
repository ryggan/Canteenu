import React, { Component } from 'react';
import moment from 'moment';

import './App.css';

import canteens from './canteens.json';

const formatHours = hours => {
  const format = hours =>
    `${hours.substring(0, 2)}:${hours.substring(2, 4)}-${hours.substring(5, 7)}:${hours.substring(7, 9)}`;

  if (typeof hours === 'string') {
    return format(hours);
  } else {
    return hours.reduce((acc, next) => `${acc}<br />${format(next)}`, '').substring(6);
  }
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_LIMIT = 60;

class App extends Component {
  state = {
    canteens: [],
    open: -1,
    now: moment().unix()
  };

  componentDidMount() {
    this.setState({ canteens: canteens.canteens });

    setInterval(() => {
      this.setState({ now: moment().unix() });
    }, 20000);
  }

  getOpen(hours) {
    let isOpen;
    let closingIn = 0;
    let opensIn = Number.MAX_VALUE;

    const now = {
      hour: parseInt(moment().format('HH'), 10),
      minute: parseInt(moment().format('mm'), 10)
    };

    if (hours.length && typeof hours === 'string') {
      const opening = {
        hour: parseInt(hours.substring(0, 2), 10),
        minute: parseInt(hours.substring(2, 4), 10)
      };
      const closing = {
        hour: parseInt(hours.substring(5, 7), 10),
        minute: parseInt(hours.substring(7, 9), 10)
      };

      closingIn = Math.floor(
        (moment()
          .set('hour', closing.hour)
          .set('minute', closing.minute)
          .unix() -
          this.state.now) /
          60
      );

      opensIn = Math.floor(
        (moment()
          .set('hour', opening.hour)
          .set('minute', opening.minute)
          .unix() -
          this.state.now) /
          60
      );

      isOpen =
        closingIn > 0 && (opening.hour < now.hour || (opening.hour === now.hour && opening.minute <= now.minute));
    } else if (hours.length) {
      const slots = [];
      for (const slot of hours) {
        const s = {};

        const opening = {
          hour: parseInt(slot.substring(0, 2), 10),
          minute: parseInt(slot.substring(2, 4), 10)
        };
        const closing = {
          hour: parseInt(slot.substring(5, 7), 10),
          minute: parseInt(slot.substring(7, 9), 10)
        };

        s.closingIn = Math.floor(
          (moment()
            .set('hour', closing.hour)
            .set('minute', closing.minute)
            .unix() -
            this.state.now) /
            60
        );

        s.opensIn = Math.floor(
          (moment()
            .set('hour', opening.hour)
            .set('minute', opening.minute)
            .unix() -
            this.state.now) /
            60
        );

        s.isOpen =
          s.closingIn > 0 && (opening.hour < now.hour || (opening.hour === now.hour && opening.minute <= now.minute));

        slots.push(s);
      }

      isOpen = slots[slots.length - 1].isOpen;
      opensIn = slots[slots.length - 1].opensIn;
      closingIn = slots[slots.length - 1].closingIn;

      for (const slot of slots) {
        if (slot.isOpen || (slot.opensIn > 0 && slot.opensIn < TIME_LIMIT)) {
          isOpen = slot.isOpen;
          opensIn = slot.opensIn;
          closingIn = slot.closingIn;
        }
      }
    } else {
      isOpen = false;
    }

    return { isOpen, opensIn, closingIn };
  }

  renderOpen({ isOpen, opensIn, closingIn }) {
    if (!isOpen && opensIn > 0 && opensIn < TIME_LIMIT) {
      return <div>{`Opens in ${opensIn} minutes`}</div>;
    }
    if (isOpen && closingIn < TIME_LIMIT) {
      return <div>{`Closing in ${closingIn} minutes`}</div>;
    }
  }

  renderCanteens() {
    const day = (moment().day() + 6) % 7;

    const canteens = this.state.canteens
      .sort((a, b) => {
        if(a.name < b.name) return -1;
        if(a.name > b.name) return 1;
        return 0;
      })
      .map((canteen, index) => {
        return {
          name: canteen.name,
          status: this.getOpen(canteen.hours[day]).isOpen
            ? this.getOpen(canteen.hours[day]).closingIn < 60
              ? 2
              : 1
            : 3,
          component: (
            <div
              className="canteen-card"
              key={`${canteen.name}${index}`}
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
                    background: this.getOpen(canteen.hours[day]).isOpen
                      ? this.getOpen(canteen.hours[day]).closingIn < 60
                        ? '#dd2'
                        : '#2d2'
                      : '#d22'
                  }}
                />
                <div className="canteen-title">
                  <h3>{canteen.name}</h3>
                </div>
              </div>
              {this.state.open !== index && this.renderOpen(this.getOpen(canteen.hours[day]))}
              {this.state.open === index && (
                <div>
                  <div className="canteen-description">
                    {canteen.description}
                  </div>
                  {canteen.hours.map((hours, index) => (
                    <div
                      key={`${canteen.name}day${index}`}
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
                        className="hours"
                        style={{
                          fontWeight: day === index ? 'bold' : 'normal'
                        }}
                        dangerouslySetInnerHTML={{ __html: hours.length ? formatHours(hours) : 'Closed' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        };
      });

    return canteens.sort((a, b) => {
      if(a.status != b.status) return a.status - b.status;
      if(a.name < b.name) return -1;
      if(a.name > b.name) return 1;
      return 0;
    }).map(canteen => canteen.component);
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title" style={{ fontWeight: '100' }}>
            &gt; cantee.nu
          </h1>
        </header>
        <div className="list">{this.renderCanteens()}</div>
      </div>
    );
  }
}

// dan chet beyoo nanee
export default App;
