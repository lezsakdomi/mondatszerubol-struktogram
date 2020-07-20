import React from 'react'
import parse from './parser'

export class Struktogram extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    static getDerivedStateFromProps(props, state) {
        const {code, errorHandler} = props
        if (code !== state.code || !state.elements) {
            let {elements = []} = state
            try {
                elements = parse(code, errorHandler).map((e, i) => ({
                    ...e,
                    ...elements[i] && {
                        width: elements[i].width,
                        height: elements[i].height,
                    },
                }))
            } catch (e) {
                if (errorHandler) {
                    errorHandler(e)
                    elements = []
                } else {
                    throw e
                }
            }
            return {code, elements}
        } else {
            return null
        }
    }

    render() {
        const {x = 0, y = 0} = this.props
        const {elements} = this.state

        if (!elements) return null

        const width = Math.max(this.computedWidth, this.props.width || 0)
        const height = Math.max(this.computedHeight, this.props.height || 0)

        return (
            <g transform={`translate(${x}, ${y})`}>
                <rect width={width} height={height} style={{
                    fill: 'none',
                    stroke: 'black',
                }}/>
                {elements.map(({class: c, ...props}, i, a) => React.createElement(c, {
                    ...props,
                    x: 0,
                    y: a.slice(0, i).map(e => e.height).reduce((a, v) => a + v, 0) || 0,
                    width,
                    onResized: ({width, height}) => {
                        console.log(i, width, height)
                        const {elements} = this.state
                        elements[i].width = width
                        elements[i].height = height
                        this.setState({
                            elements: [...elements],
                        })
                        this.props.onResized({width: this.computedWidth, height: this.computedHeight})
                    },
                    key: i, // TODO use a better key
                }, null))}
            </g>
        )
    }

    get computedWidth() {
        const {elements} = this.state
        if (!elements) return 0

        return Math.max(...elements.map(e => e.width)) || 0
    }

    get computedHeight() {
        const {elements} = this.state
        if (!elements) return 0

        return elements.map(e => e.height).reduce((a, v) => a + v, 0) || 0
    }
}