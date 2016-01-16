import React from 'react';
import cn from 'classnames';
import dates from './utils/dates';
import { accessor as get } from './utils/accessors';

let EventCell = React.createClass({
  onDragStart(e) {
    e.dataTransfer.setData("text", JSON.stringify(this.props));
    setTimeout(() => {
      this.props.dragStart()
    }, 100)
  },
  onDragEnd(e) {
    this.props.dragEnd()
  },
  render() {
    let {
        className, event, selected, eventPropGetter
      , startAccessor, endAccessor, titleAccessor
      , slotStart, slotEnd, onSelect, component, draggable, ...props } = this.props;


    let Component = component;

    let title = get(event, titleAccessor)
      , end = get(event, endAccessor)
      , start = get(event, startAccessor)
      , isAllDay = get(event, props.allDayAccessor)
      , continuesPrior = dates.lt(start, slotStart, 'day')
      , continuesAfter = dates.gt(end, slotEnd, 'day')

    if (eventPropGetter)
      var { style, className: xClassName } = eventPropGetter(event, start, end, selected);

    return (
      <div
        {...props}
        style={{...props.style, ...style}}
        className={cn('rbc-event', className, xClassName, {
          'rbc-selected': selected,
          'rbc-event-allday': isAllDay || dates.diff(start, dates.ceil(end, 'day'), 'day') > 1,
          'rbc-event-continues-prior': continuesPrior,
          'rbc-event-continues-after': continuesAfter
        })}
        draggable={draggable}
        onDragStart={this.onDragStart}
        onDragEnd={this.onDragEnd}
        onClick={()=> onSelect(event)}
      >
        <div className='rbc-event-content' title={title}>
          { Component
            ? <Component event={event} title={title}/>
            : title
          }
        </div>
      </div>
    );
  }
});

export default EventCell
