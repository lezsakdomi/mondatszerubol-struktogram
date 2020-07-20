import React from 'react'

export class Utasítás extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
        this.textRef = React.createRef()
    }

    render() {
        const {code, x = 0, y = 0, width = 400, height = 50} = this.props

        return (
            <g transform={`translate(${x}, ${y})`}>
                <rect width={width} height={height} style={{
                    fill: 'none',
                    stroke: 'black',
                }}/>
                <text ref={this.textRef} y={height - 5}>{code || "\xa0" /* nbsp */}</text>
                {/* TODO Highlight code */}
            </g>
        )
    }

    pushDimensions() {
        const {state} = this
        const bBox = this.textRef.current.getBBox()
        if (state.width !== bBox.width || state.height !== bBox.height) {
            this.setState({width: bBox.width, height: bBox.height})
            this.props.onResized(bBox)
        }
    }

    componentDidMount() {
        this.pushDimensions()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.pushDimensions()
    }
}