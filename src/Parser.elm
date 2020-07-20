-- Based on http://algtan1.elte.hu/downloads/eloadas/Bevezetes.pdf


module Parser exposing (..)

import CodeLayout exposing (..)
import ParseError exposing (..)
import String exposing (startsWith)


indentation : String
indentation =
    "  "



-- todo Missing structures:
-- todo - Program:
-- todo - különben ha ... akkor
-- todo - Elágazás
-- todo - declarations
-- todo   - Típus
-- todo   - Konstans
-- todo   - Változó
-- todo - Eljárás <code>(...): / Függvény <code>(...):<code>


parseBody : List String -> Result ParseError (List Utasítás)
parseBody lines =
    let
        keywordIndexes keyword line =
            (String.indexes (" " ++ keyword ++ " ") line |> List.map (\n -> n + 1))
                ++ (if String.endsWith (" " ++ keyword) line then
                        [ String.length line - String.length keyword ]

                    else
                        []
                   )
    in
    case lines of
        [] ->
            Ok []

        head :: tail ->
            let
                shift =
                    1
            in
            if String.isEmpty head then
                --Err <| ParseError 1 <| UnexpectedToken (Specifically EmptyLine) { expected = [ Line Any ] }
                shiftError 1 (parseBody tail) Ok

            else if startsWith indentation head then
                Err <| ParseError 1 <| UnexpectedToken (Specifically Indent) { expected = [ Line Any ] }

            else if startsWith "Ha " head then
                case keywordIndexes "akkor" head of
                    [] ->
                        Err <| ParseError 1 <| UnexpectedToken (Specifically <| Line <| Specifically <| Opening <| Specifically ParseError.Elágazás) { expected = [ Keyword <| Specifically "akkor" ] }

                    [ index ] ->
                        let
                            code =
                                String.slice (String.length "Ha ") (index - 1) head
                        in
                        if index == String.length head - String.length "akkor" then
                            shiftError shift (unindent tail) <|
                                \left ->
                                    let
                                        shift_ =
                                            shift + List.length left
                                    in
                                    shiftError shift (parseBody left) <|
                                        \left_ ->
                                            case List.drop shift_ lines of
                                                [] ->
                                                    Err <| ParseError (shift_ + 1) <| UnexpectedToken (Specifically End) { expected = [ Line <| Specifically <| Closing <| ParseError.Elágazás ] }

                                                head_ :: tail_ ->
                                                    let
                                                        shift__ =
                                                            shift_ + 1
                                                    in
                                                    if head_ == "különben" then
                                                        shiftError shift__ (unindent tail_) <|
                                                            \right ->
                                                                let
                                                                    shift___ =
                                                                        shift__ + List.length right
                                                                in
                                                                shiftError shift__ (parseBody right) <|
                                                                    \right_ ->
                                                                        case List.drop shift___ lines of
                                                                            [] ->
                                                                                Err <| ParseError (shift___ + 1) <| UnexpectedToken (Specifically <| End) { expected = [ Line <| Specifically <| Closing <| ParseError.Elágazás ] }

                                                                            head__ :: tail__ ->
                                                                                let
                                                                                    shift____ =
                                                                                        shift___ + 1
                                                                                in
                                                                                if head__ == "Elágazás vége" then
                                                                                    shiftError shift____ (parseBody tail__) <|
                                                                                        \tail___ -> Ok <| CodeLayout.Elágazás code left_ right_ :: tail___

                                                                                else
                                                                                    Err <| ParseError shift____ <| UnexpectedToken (Specifically <| Line Any) { expected = [ Line <| Specifically <| Closing <| ParseError.Elágazás ] }

                                                    else if head_ == "Elágazás vége" then
                                                        shiftError shift__ (parseBody tail_) <| \tail__ -> Ok <| CodeLayout.Elágazás code left_ [] :: tail__

                                                    else
                                                        Err <| ParseError shift__ <| UnexpectedToken (Specifically <| Line Any) { expected = [ Line <| Specifically <| Closing ParseError.Elágazás, Line <| Specifically <| Branching <| ParseError.Elágazás ] }

                        else
                            let
                                shift_ =
                                    shift + 1

                                left =
                                    String.dropLeft (index + String.length "akkor" + 1) head

                                leftOnlyResult =
                                    shiftError shift (parseBody tail) <|
                                        \tail_ -> Ok <| CodeLayout.Elágazás code [ Utasítás left ] [] :: tail_
                            in
                            case tail of
                                [] ->
                                    leftOnlyResult

                                head_ :: tail_ ->
                                    let
                                        trimLeft s =
                                            case String.toList s of
                                                [] ->
                                                    ""

                                                head__ :: tail__ ->
                                                    if head__ == ' ' then
                                                        trimLeft <| String.fromList tail__

                                                    else
                                                        s
                                    in
                                    if trimLeft head_ |> startsWith "különben " then
                                        shiftError shift_ (parseBody tail_) <|
                                            \tail__ ->
                                                Ok <|
                                                    CodeLayout.Elágazás
                                                        code
                                                        [ Utasítás left ]
                                                        [ Utasítás <| String.dropLeft (String.length "különben ") <| trimLeft head_
                                                        ]
                                                        :: tail__

                                    else
                                        leftOnlyResult

                    _ ->
                        Err <| ParseError 1 <| Ambiguous <| Keyword <| Specifically "akkor"

            else if startsWith "Ciklus amíg " head then
                let
                    code =
                        String.dropLeft (String.length "Ciklus amíg ") head
                in
                case unindent tail of
                    Err { row, reason } ->
                        Err <| ParseError (shift + row) reason

                    Ok body ->
                        let
                            shift_ =
                                shift + List.length body
                        in
                        case List.drop (List.length body) tail of
                            [] ->
                                Err <| ParseError (shift_ + 1) <| UnexpectedToken (Specifically End) { expected = [ Line <| Specifically <| Closing Ciklus ] }

                            endLine :: tail_ ->
                                if endLine /= "Ciklus vége" then
                                    Err <| ParseError (shift_ + 1) <| UnexpectedToken Any { expected = [ Line <| Specifically <| Closing Ciklus ] }

                                else
                                    let
                                        shift__ =
                                            shift_ + 1
                                    in
                                    case parseBody body of
                                        Err { row, reason } ->
                                            Err <| ParseError (shift + row) reason

                                        Ok body_ ->
                                            case parseBody tail_ of
                                                Err { row, reason } ->
                                                    Err <| ParseError (shift__ + row) reason

                                                Ok tail__ ->
                                                    Ok <| ElöltesztelősCiklus code body_ :: tail__

            else if head == "Ciklus" then
                shiftError shift (unindent tail) <|
                    \body ->
                        let
                            shift_ =
                                shift + List.length body
                        in
                        shiftError shift (parseBody body) <|
                            \body_ ->
                                let
                                    shift__ =
                                        shift_ + 1

                                    shift___ =
                                        shift__ + 1

                                    shift____ =
                                        shift___ + 1
                                in
                                case List.drop shift_ lines of
                                    [] ->
                                        Err <| ParseError shift__ <| UnexpectedToken (Specifically <| End) { expected = [ Line <| Specifically <| Branching ParseError.Ciklus ] }

                                    [ _ ] ->
                                        Err <| ParseError shift__ <| UnexpectedToken (Specifically <| End) { expected = [ Line <| Specifically <| Closing ParseError.Ciklus ] }

                                    head_ :: head__ :: tail__ ->
                                        if startsWith "amíg " head_ then
                                            let
                                                code =
                                                    String.dropLeft (String.length "amíg ") head_
                                            in
                                            if head__ == "Ciklus vége" then
                                                shiftError shift__ (parseBody tail__) <|
                                                    \tail___ -> Ok <| HátultesztelősCiklus code body_ :: tail___

                                            else
                                                Err <| ParseError shift___ <| UnexpectedToken (Specifically <| Line Any) { expected = [ Line <| Specifically <| Closing ParseError.Ciklus ] }

                                        else
                                            Err <| ParseError shift____ <| UnexpectedToken (Specifically <| Line Any) { expected = [ Line <| Specifically <| Branching ParseError.Ciklus ] }

            else
                case parseBody tail of
                    Err { row, reason } ->
                        Err <| ParseError (shift + row) reason

                    Ok list ->
                        Ok <| [ Utasítás head ] ++ list


shiftError : Int -> Result ParseError data -> (data -> Result ParseError result) -> Result ParseError result
shiftError shift result next =
    case result of
        Err { row, reason } ->
            Err <| ParseError (shift + row) reason

        Ok data ->
            next data


unindent : List String.String -> Result ParseError (List String.String)
unindent lines =
    case lines of
        head :: tail ->
            let
                shift =
                    1
            in
            if startsWith indentation head then
                case unindent tail of
                    Err { row, reason } ->
                        Err <| ParseError (row + shift) reason

                    Ok tail_ ->
                        Ok <| String.dropLeft (String.length indentation) head :: tail_

            else
                Ok <| []

        [] ->
            Err <| ParseError 1 <| UnexpectedToken (Specifically End) { expected = [ Unindent ] }
