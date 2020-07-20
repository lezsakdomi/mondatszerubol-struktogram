module Home exposing (view)

import Browser exposing (Document)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Msg exposing (..)



--noinspection SpellCheckingInspection


view : Document Msg
view =
    Browser.Document "Home | Mondatszerűből Struktogram" <|
        [ main_ [ onClick EnterApp ]
            [ h1 [] [ text "Mondatszerűből struktogram" ]
            , p []
                [ text
                    """
                Üdv! Ez egy egyszerű kis segédprogram Nassi–Shneiderman diagramok előállításához, ELTE-stílusban.
                A program kialakításakor az "Algoritmizálás, adatmodellezés tanítása" tantárgy tananyagát vettem alapul
                a szintaktikához.
                """
                , br [] []
                , a [ href "http://algtan1.elte.hu/downloads/eloadas/Bevezetes.pdf" ]
                    [ text
                        """
                    »
                    Bevezető előadás diái, amiken a mondatszerű leírást és a struktogramot specifikálják
                    """
                    ]
                ]
            , p []
                [ text
                    """
                A programot Lezsák Domonkos készítette, Szalayné Tahy Zsuzsanna tanárnő elképzelése alapján.
                A mondatszerű leírás értelmezése Elm-mel történik, míg a megjelenítésért JavaScript kód felel.
                A két komponens között a Web Components technológia nyújt hidat.
                A program mindenkor legfrissebb verziója GitHub-on megtalálható (lezsakdomi/mondatszerubol-struktogram).
                """
                , br [] []
                , text
                    """
                A program CreativeCommons BY-NC-SA alatt továbbadható, de nincs tesztelve, használat csak saját felelősségre, stb.
                """
                , br [] []
                , a [ href "http://domonkos.lezsák.hu" ]
                    [ text
                        """
                    »
                    A készítő elérhetőségei
                    """
                    ]
                ]
            , h3 [] [ text "A következőek kerültek implementálásra:" ]
            , p []
                [ ul []
                    [ li [] [ text "Szekvencia" ]
                    , li []
                        [ text "Elágazás"
                        , br [] []
                        , small []
                            [ text "(kivétel: "
                            , code [] [ text "különben ha ... akkor" ]
                            , text ")"
                            ]
                        ]
                    , li [] [ text "Ciklus" ]
                    , li [] [ text "Hátultesztelős ciklus" ]
                    ]
                , br [] []
                , small []
                    [ text "Kivéve a következő eltéréseket:"
                    , ul []
                        [ li [] [ text "Az utasítások balra igazítottak" ]
                        ]
                    , text "Ha valaki ezeken módosítani szeretne, az jelezze egy GitHub issue formájában!"
                    ]
                ]
            , button [ autofocus True, onClick EnterApp, style "width" "100%" ]
                [ text "Engedj tovább, használni szeretném"
                ]
            ]
        ]
