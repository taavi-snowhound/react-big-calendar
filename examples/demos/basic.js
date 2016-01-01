import React, { PropTypes } from 'react';
import BigCalendar from 'react-big-calendar';
import events from '../events';

let Basic = React.createClass({
  getInitialState() {
    return {events}
  },
  onEventDrop(event, start, end) {
    console.dir(event)

    console.log(start.format('MM/DD/YYYY HH:mm:ss'), end.format('MM/DD/YYYY HH:mm:ss'))
    let newEvents = Object.assign([], this.state.events)

    newEvents = newEvents.map((v) => {
      if(v.title === event.title) {
        v.start = start
        v.end = end
      }
      return v
    })


    this.setState({events: newEvents})

  },
  render(){
    return (
      <div>
        <BigCalendar
          events={this.state.events}
          onEventDrop={this.onEventDrop}
          defaultDate={new Date(2015, 3, 1)}
        />
      </div>
    )
  }
})

export default Basic;
