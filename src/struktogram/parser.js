import {Utasítás} from './Utasítás'
import React from 'react'
import {Elágazás} from './Elágazás'

export class ParseError extends Error {
    constructor(code, lineNumber, reason, solution) {
        super(`Failed to parse code at line ${lineNumber}: ${reason}

${solution ? `Here's a tip: ${solution}` : `It isn't so common, so you are on your own. (Have you tried StackOverflow?)`}

Here is the relevant part:
  ...
| ${showLine(-2)}
| ${showLine(-1)}
> ${showLine(0)}
| ${showLine(1)}
| ${showLine(2)}
  ...
`)

        this.code = code
        this.lineNumber = lineNumber
        this.reason = reason
        this.solution = solution

        function showLine(relativeIndex) {
            let line = code.split("\n")[lineNumber + relativeIndex] || (relativeIndex > 0 ? "EOF" : "---")
            line = line.replace(/\s*$/, s => "#".repeat(s.length))
            return line
        }
    }
}

export default function parse(code, errorForwarder) {
    if (code.match(/^\s/)) {
        return [
            {
                class: Utasítás,
                code: code,
                ref: React.createRef(),
            },
        ]
    } else {
        const elements = []

        const lines = code.split("\n")
        for (let i = 0; i < lines.length; i++) {
            let found = false

            for (let C of [
                Elágazás,
            ]) {
                const {start = "", begin = "", branch = "", end = ""} = C.keywords

                const [upper, lower] = tryCases(start || begin, lines[i])

                if (upper || lower) {
                    let j = -1 // begin starts at j
                    if (!start) {
                        j = 0
                    } else if (!begin) {
                        j = start.length
                    } else {
                        j = lines[i].slice(start.length).indexOf(upper ? begin.toUpperCase() : begin.toLowerCase())
                        if (j >= 0) j += start.length
                    }

                    if (j >= 0) {
                        const head = lines[i].slice(start.length, j)//.trim()

                        let k = j + begin.length // begin ends before k; body starts at k
                        if (lines[i][k] === ":") k++
                        if (lines[i][k] === " ") k++ // definite order

                        // todo handler linne breaks in heads

                        if (k === lines[i].length) {
                            // We've got indented body
                            const indentMatch = lines[i + 1].match(/^\s+/)
                            if (!indentMatch) {
                                throw new ParseError(code, i,
                                    `Seems like a(n) ${C.name.toLowerCase()} with a long body, but the next line is not indented`,
                                    `Try deleting or unindenting that line and see how it gets parsed`,
                                )
                            } else {
                                const indent = indentMatch[0]
                                let l // l holds the line after the block
                                for (l = i + 1; l < lines.length; l++) {
                                    if (!lines[l].startsWith(indent)) {
                                        break
                                    }
                                }

                                const firstBlock = lines.slice(i + 1, l).map(s => s.replace(indent, "")).join("\n") // replaces only once

                                if (branch) {
                                    if (lines[l]) {
                                        if (lines[l].startsWith(upper ? branch.toUpperCase() : branch.toLowerCase())) {
                                            if (lines[l].length === branch.length) {
                                                if (!lines[l + 1].startsWith(indent)) {
                                                    throw new ParseError(code, l + 1,
                                                        `Seems like a second branch, but the line is not indented as the first one`,
                                                        `Indent it properly or delete the previous line (${branch} keyword)`,
                                                    )
                                                } else if (lines[l + 1].slice(indent.length).match(/^\s/)) {
                                                    throw new ParseError(code, l + 1,
                                                        `Too much indent`,
                                                        `Indent the second branch exactly like the first one`,
                                                    )
                                                } else {
                                                    let m
                                                    for (m = l + 1; m < lines.length; m++) {
                                                        if (!lines[m].startsWith(indent)) {
                                                            break
                                                        }
                                                    }

                                                    const secondBlock = lines.slice(l + 1, m).map(s => s.replace(indent, "")).join("\n") // replaces only once

                                                    if (end && lines[m] && lines[m].length === end.length && lines[m].startsWith(upper ? end.toUpperCase() : end.toLowerCase())) m++
                                                    // todo check for similarities

                                                    found = true
                                                    elements.push({
                                                        class: C,
                                                        head,
                                                        branches: [firstBlock, secondBlock],
                                                        headErrorHandler: getErrorHandler(i),
                                                        branchErrorHandlers: [getErrorHandler(i + 1), getErrorHandler(l + 1)],
                                                    })
                                                    i = m - 1
                                                }
                                            } else {
                                                throw new ParseError(code, l,
                                                    `This line seems like a branch separator, but also contains something else`,
                                                    `Try using the same style on the second branch as on the first one. Check leftover whitespaces, etc.`,
                                                )
                                                // todo try parsing as a one-liner before throwing an error
                                            }
                                        } else {
                                            if (end && lines[l] && lines[l].length === end.length && lines[l].startsWith(upper ? end.toUpperCase() : end.toLowerCase())) l++
                                            // todo check for similarities

                                            found = true
                                            elements.push({
                                                class: C,
                                                head,
                                                branches: [firstBlock],
                                                headErrorHandler: getErrorHandler(i),
                                                branchErrorHandlers: [getErrorHandler(i + 1)],
                                            })
                                            i = l - 1
                                        }
                                    } else {
                                        found = true
                                        elements.push({
                                            class: C,
                                            head,
                                            branches: [firstBlock],
                                            headErrorHandler: getErrorHandler(i),
                                            branchErrorHandlers: [getErrorHandler(i + 1)],
                                        })
                                        i = l - 1
                                    }
                                } else {
                                    if (lines[l] && end && lines[l].length === end.length && lines[l].startsWith(upper ? end.toUpperCase() : end.toLowerCase())) l++
                                    // todo check for similarities

                                    found = true
                                    elements.push({
                                        class: C,
                                        head,
                                        body: firstBlock,
                                        headErrorHandler: getErrorHandler(i),
                                        bodyErrorHandler: getErrorHandler(i + 1),
                                    })
                                    i = l - 1
                                }
                            }
                        } else {
                            // We've got an one-liner body
                            // todo handle one-liner bodies with line breaks

                            const firstBlock = lines[i].slice(j + begin.length)//.trim()

                            if (branch) {
                                if (lines[i + 1]) {
                                    if (lines[i + 1].startsWith(upper ? branch.toUpperCase() : branch.toLowerCase())) {
                                        if (lines[i + 1][branch.length] === " ") {
                                            const secondBlock = lines[i + 1].slice(branch.length)//.trim()

                                            found = true
                                            elements.push({
                                                class: C,
                                                head,
                                                branches: [firstBlock, secondBlock],
                                                headErrorHandler: getErrorHandler(i),
                                                branchErrorHandlers: [getErrorHandler(i + 1), getErrorHandler(i + 1)],
                                            })
                                            i = i + 1
                                        } else {
                                            throw new ParseError(code, i,
                                                `Found a branch keyword, but there is nothing after it`,
                                                `Try deleting this line, or if you started your first branch as a one-liner continue the second branch in the same style`,
                                            )
                                        }
                                    } else {
                                        found = true
                                        elements.push({
                                            class: C,
                                            head,
                                            branches: [firstBlock],
                                            headErrorHandler: getErrorHandler(i),
                                            branchErrorHandlers: [getErrorHandler(i + 1)],
                                        })
                                        i = i + 0
                                    }
                                } else {
                                    found = true
                                    elements.push({
                                        class: C,
                                        head,
                                        branches: [firstBlock],
                                        headErrorHandler: getErrorHandler(i),
                                        branchErrorHandlers: [getErrorHandler(i + 1)],
                                    })
                                    i = i + 0
                                }
                            } else {
                                found = true
                                elements.push({
                                    class: C,
                                    head,
                                    branches: [firstBlock],
                                    headErrorHandler: getErrorHandler(i),
                                    branchErrorHandlers: [getErrorHandler(i + 1)],
                                })
                                i = i + 0
                            }
                        }


                    } else if (start && !begin) {
                        // todo check for multiline heads
                        // todo check for short forms
                    }
                }

                if (found) {
                    break
                }

                function tryCases(needle, haystack) {
                    const upper = haystack.startsWith(needle.toUpperCase())
                    const lower = haystack.startsWith(needle.toLowerCase()) || haystack.startsWith(needle[0].toUpperCase() + needle.slice(1).toLowerCase())

                    return [upper, lower]
                }
            }

            if (!found) {
                if (lines[i].match(/^\s/)) {
                    throw new ParseError(code, i,
                        `Unexpected indent`,
                        `Probably you used a construct not understood by the parser`,
                    )
                }

                for (let fragment of lines[i].split(/; ?/g)) {
                    elements.push({
                        class: Utasítás,
                        code: fragment,
                        errorHandler: getErrorHandler(i),
                    })
                }
            }

            function getErrorHandler(lineNumber) {
                return function (e) {
                    if (e instanceof ParseError) {
                        const error = new ParseError(code, e.lineNumber + lineNumber, e.reason, e.solution)
                        if (errorForwarder) errorForwarder(error)
                        else throw error
                    }
                }
            }
        }

        for (let element of elements) {
            element.ref = React.createRef()
        }

        return elements
    }
}