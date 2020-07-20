module X exposing (..)

import Html exposing (..)


diagram body =
    node "x-diagram" [] [ body ]


struktogram nodes =
    node "x-struktogram" [] nodes


utasítás code =
    node "x-utasitas" [] [ text code ]


elágazás code left right =
    node "x-elagazas" [] [ text code, left, right ]


elöltesztelősCiklus code body =
    node "x-eloltesztelos-ciklus" [] [ text code, body ]


hátultesztelősCiklus code body =
    node "x-hatultesztelos-ciklus" [] [ text code, body ]
