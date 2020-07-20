import React from 'react'
import {Struktogram} from './struktogram/Struktogram'
import * as PropTypes from 'prop-types'

class Diagram extends React.Component {
    constructor(props) {
        super(props);

        this.state = {}
        this.struktogramRef = React.createRef()
    }

    static getDerivedStateFromError(e) {
        return {error: e}
    }

    static getDerivedStateFromProps(props, state) {
        if (props.code !== state.code) {
            return {
                code: props.code,
                error: null,
            }
        } else {
            return null
        }
    }

    render() {
        const {error} = this.state

        if (error) {
            return (
                <div>
                    <p>Something terrible happened.</p>
                    <pre>
                        {error.toString()}
                    </pre>
                </div>
            )
        } else {
            let {code} = this.props
            const {width = 0, height = 0} = this.state

            const programNameRegex = /^.+:\n/
            const programNameMatch = code.match(programNameRegex)
            if (programNameMatch) code = code.replace(programNameRegex, "")

            const programEndRegex = /\n(?:Vége|Program vége|PROGRAM VÉGE).?$/
            const programEndMatch = code.match(programEndRegex)
            if (programEndMatch) code = code.replace(programEndRegex, "")

            const indentRegex = /^\s*/
            const indentMatch = code.match(indentRegex)
            code = code.replace(new RegExp("(\n|^)" + indentMatch[0], 'g'), "\n")
            code = code.replace(/^\n/, "")

            const variablesRegex = /^(?:Változók|VÁLTOZÓK):?\n(?:\s+.*\n)*\n?/
            const variablesMatch = code.match(variablesRegex)
            if (variablesMatch) code = code.replace(variablesRegex, "")

            return (
                <svg width={width} height={height}>
                    <g>
                        <Struktogram code={code} errorHandler={e => {
                            this.setState({error: e})
                        }} onResized={({width, height}) => {
                            this.setState({width, height})
                        }}/>
                    </g>
                </svg>
            )
        }
    }
}

Diagram.propTypes = {code: PropTypes.any}

export default Diagram
