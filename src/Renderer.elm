module Renderer exposing (diagram, sample)

import CodeLayout exposing (..)
import Html exposing (Html)
import X


diagram : List Utasítás -> Html msg
diagram list =
    X.diagram <|
        struktogram list


struktogram : List Utasítás -> Html msg
struktogram list =
    X.struktogram <|
        List.map utasítás list


utasítás : Utasítás -> Html msg
utasítás u =
    case u of
        Utasítás code ->
            X.utasítás code

        Elágazás code left right ->
            X.elágazás code (struktogram left) (struktogram right)

        ElöltesztelősCiklus code body ->
            X.elöltesztelősCiklus code (struktogram body)

        HátultesztelősCiklus code body ->
            X.hátultesztelősCiklus code (struktogram body)


sample : Html msg
sample =
    X.diagram <|
        X.struktogram
            [ X.utasítás "I := 0"
            , X.elöltesztelősCiklus "I <= 10"
                (X.struktogram
                    [ X.elágazás "I < 10"
                        (X.struktogram
                            [ X.utasítás "I := I + 1"
                            ]
                        )
                        (X.struktogram
                            [ X.utasítás "KI: I"
                            , X.utasítás "KI: \"Manual abort!\""
                            , X.utasítás "BREAK"
                            ]
                        )
                    ]
                )
            , X.utasítás "End of loop"
            , X.hátultesztelősCiklus "I <= 10"
                (X.struktogram
                    [ X.elágazás "I < 10"
                        (X.struktogram
                            [ X.utasítás "I := I + 1"
                            ]
                        )
                        (X.struktogram
                            [ X.utasítás "KI: I"
                            , X.utasítás "KI: \"Manual abort!\""
                            , X.utasítás "BREAK"
                            ]
                        )
                    ]
                )
            , X.utasítás "End of loop"
            ]
