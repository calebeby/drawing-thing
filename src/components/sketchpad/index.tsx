import { h, Component } from 'preact'
import style from './style'
import Button from '../button'
import deleteIcon from '../../icons/delete'
import undoIcon from '../../icons/undo'
import redoIcon from '../../icons/redo'
import Icon from '../icon'

interface Props {}

interface Point {
  x: number
  y: number
}

interface Line {
  start: Point
  end: Point
}

interface Stroke {
  lines: Line[]
}

interface State {
  strokes: Stroke[]
  history: Stroke[]
  currentPoint: Point
  canvas: HTMLCanvasElement | null
  ctx: CanvasRenderingContext2D | null
  clicked: boolean
  /**
   * Visual representation on the canvas does not reflect strokes in state
   */
  invalidated: boolean
}

const getPoint = (e: TouchEvent | MouseEvent): Point => {
  if (e instanceof TouchEvent) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    return {
      x: e.targetTouches[0].pageX - rect.left,
      y: e.targetTouches[0].pageY - rect.top,
    }
  }
  return { x: e.offsetX, y: e.offsetY }
}

class Sketchpad extends Component<Props, State> {
  state = {
    strokes: [],
    history: [],
    currentPoint: { x: 0, y: 0 },
    canvas: null,
    ctx: null,
    clicked: false,
    invalidated: false,
  }

  shouldComponentUpdate(oldState: State, newState: State) {
    return newState.invalidated
  }

  componentDidMount() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    this.setState({ canvas, ctx: canvas.getContext('2d') })
  }

  mouseDown = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    console.log('mousedown', e)

    const point = getPoint(e)

    this.setState((state: State) => ({
      currentPoint: point,
      strokes: state.strokes.concat({ lines: [] }),
      clicked: true,
    }))
  }

  mouseUp = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    console.log('mouseup', e)

    this.setState((state: State) => {
      const s: { clicked: boolean; strokes: Stroke[] } = {
        clicked: false,
        strokes: state.strokes,
      }
      if (s.strokes[s.strokes.length - 1].lines.length === 0) {
        s.strokes[s.strokes.length - 1].lines.push({
          start: state.currentPoint,
          end: state.currentPoint,
        })
      }
      return s
    })
  }

  mouseMove = (e: MouseEvent | TouchEvent) => {
    const point = getPoint(e)

    this.setState((state: State) => {
      if (!state.clicked) {
        return
      }
      console.log('move')
      const start = state.currentPoint
      const end = point
      state.strokes[state.strokes.length - 1].lines.push({ start, end })
      if (state.ctx) {
        state.ctx.beginPath()
        state.ctx.moveTo(start.x, start.y)
        state.ctx.lineTo(end.x, end.y)
        state.ctx.stroke()
      }
      return {
        currentPoint: point,
        strokes: state.strokes,
      }
    })
  }

  clear = () => {
    this.setState({ strokes: [], history: [], invalidated: true })
  }

  undo = () => {
    this.setState((state: State) => {
      const undoneStroke = state.strokes.pop()
      if (!undoneStroke) {
        return
      }
      state.history.push(undoneStroke)
      return {
        strokes: state.strokes,
        history: state.history,
        invalidated: true,
      }
    })
  }

  redo = () => {
    this.setState((state: State) => {
      const redoneStroke = state.history.pop()
      if (!redoneStroke) {
        return
      }
      state.strokes.push(redoneStroke)

      const ctx = state.ctx
      if (ctx) {
        ctx.beginPath()
        redoneStroke.lines.forEach(line => {
          ctx.moveTo(line.start.x, line.start.y)
          ctx.lineTo(line.end.x, line.end.y)
        })
        ctx.stroke()
      }

      return {
        strokes: state.strokes,
        history: state.history,
        invalidated: false,
      }
    })
  }

  render({  }: Props, { invalidated, strokes, canvas, ctx }: State) {
    if (invalidated && ctx !== null && canvas !== null) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()

      strokes.forEach(stroke => {
        stroke.lines.forEach(line => {
          ctx.moveTo(line.start.x, line.start.y)
          ctx.lineTo(line.end.x, line.end.y)
        })
      })
      ctx.stroke()
      this.setState({ invalidated: false })
    }

    return (
      <div class={style.sketchpad}>
        <div class={style.toolbar}>
          <Button onClick={this.clear}>
            <Icon icon={deleteIcon} />
          </Button>
          <Button onClick={this.undo}>
            <Icon icon={undoIcon} />
          </Button>
          <Button onClick={this.redo}>
            <Icon icon={redoIcon} />
          </Button>
        </div>
        <canvas
          id="canvas"
          onMouseDown={this.mouseDown}
          onMouseUp={this.mouseUp}
          onTouchEnd={this.mouseUp}
          onTouchStart={this.mouseDown}
          onTouchMove={this.mouseMove}
          onMouseMove={this.mouseMove}
        />
      </div>
    )
  }
}

export default Sketchpad
