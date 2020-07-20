import React from 'react'
import {Struktogram} from './Struktogram'

const headHeight = 30
const borderWidth = 10

export class Elágazás extends React.Component {
    constructor(props) {
        super(props)

        this.headTextRef = React.createRef()
        this.leftBranchRef = React.createRef()
        this.rightBranchRef = React.createRef()

        this.state = {
            left: {width: 0, height: 0},
            right: {width: 0, height: 0},
            headText: {width: 0, height: 0},
        }
    }

    render() {
        const {
            x = 0, y = 0,
            head = "",
            branches: [leftBranch = "", rightBranch = ""], branchErrorHandlers: [leftErrorHandler, rightErrorHandler],
        } = this.props
        const {
            left: {width: leftWidth},
        } = this.state

        const width = Math.max(this.computedWidth, this.props.width || 0)
        const height = Math.max(this.computedHeight, this.props.height || 0)

        return (
            <g transform={`translate(${x}, ${y})`}>
                <rect width={width} height={headHeight} style={{
                    fill: 'none',
                    stroke: 'black',
                }}
                />
                <line x1={0} y1={0} x2={borderWidth} y2={headHeight} stroke="black"/>
                <line x1={width} y1={0} x2={width - borderWidth} y2={headHeight} stroke="black"/>
                <text x={borderWidth} y={headHeight - 5} ref={this.headTextRef}>{head}</text>
                <Struktogram
                    x={0} y={headHeight} width={leftWidth} height={height - headHeight}
                    code={leftBranch} errorHandler={leftErrorHandler} onResized={(bBox) => {
                        this.setState({left: bBox})
                        this.pushDimensions()
                    }}
                />
                <Struktogram
                    x={leftWidth} y={headHeight} width={width - leftWidth} height={height - headHeight}
                    code={rightBranch} errorHandler={rightErrorHandler} onResized={bBox => {
                        console.log("Received", bBox)
                        this.setState({right: bBox})
                        this.pushDimensions()
                    }}
                />
            </g>
        )
    }

    updateComputed() {
        const saved = this.state.headText
        const bBox = this.headTextRef.current.getBBox()

        if (bBox.width !== saved.width || bBox.height !== saved.height) {
            this.setState({headText: bBox})
            this.pushDimensions()
        }
    }

    pushDimensions() {
        console.log("Sending", this.computedWidth, this.computedHeight)
        this.props.onResized({width: this.computedWidth, height: this.computedHeight})
    }

    componentDidMount() {
        this.updateComputed()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateComputed()
    }

    get computedWidth() {
        return Math.max(this.state.headText.width + 2 * borderWidth, this.state.left.width + this.state.right.width) || 0
    }

    get computedHeight() {
        console.log("Using", this.state.right.height)
        return (Math.max(this.state.left.height, this.state.right.height) + headHeight) || 0
    }

    static keywords = {
        start: "HA",
        begin: "AKKOR",
        branch: "KÜLÖNBEN",
        end: "ELÁGAZÁS VÉGE",
    }
}