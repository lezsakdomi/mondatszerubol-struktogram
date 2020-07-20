import React from 'react'
import './App.css'
import Diagram from './Diagram'

class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            code: `
Szörpautomata:
    Válaszd ki a megfelelő szörpöt!
    HA van 5 db 20 Ft-osod AKKOR
        Dobj be 5 db 20 Ft-ost!
    KÜLÖNBEN
        Dobj be egy 100 Ft-ost!
    Nyomd meg a kiválasztott szörphöz tartozó gombot!
    ISMÉTELD AMÍG folyik a szörp: Nézd a poharat!
    Vedd ki a poharat!
Vége.
`
                .replace(/^\n|\n$/g, '')
                .replace(/ {4}/g, '  '),
        }
    }

    render() {
        const {code} = this.state

        return (
            <div className="App">
                <textarea
                    onChange={({target: {value: code}}) => this.setState({code})}
                    onKeyPress={e => {
                        e.persist()
                        window.e = e
                        if (e.key === 'Enter') {
                            const target = e.target
                            const {value: s, selectionStart: ss, selectionEnd: se} = target

                            if (e.ctrlKey) {
                                // noop
                            } else if (e.shiftKey) {
                                let i;
                                for (i = ss - 1; i >= 0; i--) {
                                    if (s[i] === "\n") break;
                                }
                                target.value = s.slice(0, ss) + "\n" + " ".repeat(ss - i - 1) + s.slice(se)
                                target.selectionStart = target.selectionEnd = ss + ss - i
                                e.preventDefault()
                                this.setState({code: target.value})
                            } else {
                                let i, j;
                                for (i = ss - 1; i > 0; i--) {
                                    if (s[i] === "\n") break;
                                }
                                for (j = i + 1; j < s.length; j++) {
                                    if (!/[^\S\n]/.exec(s[j])) break;
                                }
                                target.value = s.slice(0, ss) + "\n" + s.slice(i + 1, j) + s.slice(se)
                                target.selectionStart = target.selectionEnd = ss + j - i
                                e.preventDefault()
                                this.setState({code: target.value})
                            }
                        }
                    }}
                    value={code}
                    rows={code.split("\n").length}
                    cols={code.split("\n").reduce((a, l) => Math.max(a, l.length), 0) + 1}
                />
                <Diagram code={code} />
            </div>
        )
    }
}

export default App
