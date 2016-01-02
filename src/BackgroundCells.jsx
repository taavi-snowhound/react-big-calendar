import React from 'react';
import { findDOMNode } from 'react-dom';
import cn from 'classnames';
import { segStyle } from './utils/eventLevels';
import { notify } from './utils/helpers';
import { dateCellSelection, slotWidth, getCellAtX, pointInBox } from './utils/selection';
import Selection, { getBoundsForNode } from './Selection';
import moment from 'moment'

class DisplayCells extends React.Component {

  static propTypes = {
    selectable: React.PropTypes.bool,
    onSelect: React.PropTypes.func,
    slots: React.PropTypes.number,
    rows: React.PropTypes.array
  }

  state = { selecting: false }

  componentDidMount(){
    this.props.selectable
      && this._selectable()
  }

  componentWillUnmount() {
    this._teardownSelectable();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectable && !this.props.selectable)
      this._selectable();
    if (!nextProps.selectable && this.props.selectable)
      this._teardownSelectable();
  }
  ondrop(day, e) {
    e.preventDefault()
    
    const raw = e.dataTransfer.getData("event");
    const {event} = JSON.parse(raw)

    const {start, end} = event
    const diff = moment(end).diff(moment(start), 'days')

    const newStart = moment(day)
    const newEnd = moment(day).add(diff, 'days')

    newStart.hour(moment(start).hour())
    newStart.minute(moment(start).minute())
    newStart.second(moment(start).second())

    newEnd.hour(moment(end).hour())
    newEnd.minute(moment(end).minute())
    newEnd.second(moment(end).second())    

    this.props.onEventDrop(event, newStart, newEnd)
  }
  ondragover(e) {
    e.preventDefault()
  }
  render(){
    let { slots, row, dragging } = this.props;
    let { selecting, startIdx, endIdx } = this.state

    let children = [];

    for (var i = 0; i < slots; i++) {
      children.push(
        <div
          key={'bg_' + i}
          style={Object.assign(segStyle(1, slots), dragging ? {zIndex: "8"} : {})}
          className={cn('rbc-day-bg', {
            'rbc-selected-cell': selecting && i >= startIdx && i <= endIdx
          })}
          onDragOver={this.ondragover.bind(this)}
          onDrop={this.ondrop.bind(this, row && row[i] ? row[i] : null)} >


        </div>
      )
    }

    return (
      <div className='rbc-row-bg'>
        { children }
      </div>
    )
  }

  _selectable(){
    let node = findDOMNode(this);
    let selector = this._selector = new Selection(this.props.container)

    selector.on('selecting', box => {
      let { slots } = this.props;

      let startIdx = -1;
      let endIdx = -1;

      if (!this.state.selecting) {
        notify(this.props.onSelectStart, [box]);
        this._initial = { x: box.x, y: box.y };
      }
      if (selector.isSelected(node)) {
        let nodeBox = getBoundsForNode(node);

        ({ startIdx, endIdx } = dateCellSelection(
            this._initial
          , nodeBox
          , box
          , slots));
      }

      this.setState({
        selecting: true,
        startIdx, endIdx
      })
    })

    selector
      .on('click', point => {
        let rowBox = getBoundsForNode(node)

        if (pointInBox(rowBox, point)) {
          let width = slotWidth(getBoundsForNode(node),  this.props.slots);
          let currentCell = getCellAtX(rowBox, point.x, width);

          this._selectSlot({
            startIdx: currentCell,
            endIdx: currentCell
          })
        }

        this._initial = {}
        this.setState({ selecting: false })
      })

    selector
      .on('select', () => {
        this._selectSlot(this.state)
        this._initial = {}
        this.setState({ selecting: false })
        notify(this.props.onSelectEnd, [this.state]);
      })
  }

  _teardownSelectable() {
    if (!this._selector) return
    this._selector.teardown();
    this._selector = null;
  }

  _selectSlot({ endIdx, startIdx }) {
    this.props.onSelectSlot &&
      this.props.onSelectSlot({
        start: startIdx, end: endIdx
      })
  }
}

export default DisplayCells;
