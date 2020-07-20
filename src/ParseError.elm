module ParseError exposing (..)


type alias ParseError =
    { row : Int, reason : ErrorReason }


type ErrorReason
    = UnexpectedToken (MaybeSpecified Token) { expected : List Token }
    | Ambiguous Token


type Token
    = End
    | EmptyLine
    | Indent
    | Unindent
    | Line (MaybeSpecified Line)
    | Keyword (MaybeSpecified String)


type Line
    = Opening (MaybeSpecified Structure)
    | Branching Structure
    | Closing Structure


type Structure
    = Ciklus
    | Elágazás


type MaybeSpecified a
    = Any
    | Specifically a
