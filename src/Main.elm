module Main exposing (main)

import Browser
import Browser.Dom
import Home
import Html
import Html.Attributes
import Html.Events
import Msg exposing (..)
import Parser
import Renderer
import Task


main : Program Flags Model Msg
main =
    Browser.document { init = init, view = view, update = update, subscriptions = subscriptions }


type alias Flags =
    ()


type Model
    = Home
    | LiveRender String


init : Flags -> ( Model, Cmd Msg )
init =
    always ( Home, Cmd.none )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NoOp ->
            ( model, Cmd.none )

        GotCode code ->
            ( LiveRender code, Cmd.none )

        EnterApp ->
            ( LiveRender
                """I := 0
Ciklus amíg I <= 10
  Ha I < 10 akkor
    I := I + 1
  különben
    Ki: I
    Ki: "Manual abort!"
    BREAK
  Elágazás vége
Ciklus vége
end of loop
Ciklus
  Ha I < 10 akkor I := I + 1
  különben Ki: I
amíg I <= 10
Ciklus vége
end of loop"""
            , Task.attempt (\_ -> NoOp) (Browser.Dom.focus "textarea")
            )


subscriptions : Model -> Sub Msg
subscriptions =
    always Sub.none


view : Model -> Browser.Document Msg
view model =
    case model of
        Home ->
            Home.view

        LiveRender code ->
            Browser.Document "mondatszerűből struktogram" <|
                [ Html.textarea
                    [ Html.Attributes.id "textarea"
                    , Html.Attributes.value code
                    , Html.Events.onInput GotCode
                    , Html.Attributes.placeholder "Type some mondatszerű code here..."
                    , Html.Attributes.rows <| 1 + (String.split "\n" code |> List.length)
                    , Html.Attributes.cols <| 1 + (String.split "\n" code |> List.map String.length |> List.maximum |> Maybe.withDefault 0)
                    , Html.Attributes.attribute "data-autoindent" "on"
                    ]
                    []
                , case String.isEmpty code of
                    True ->
                        Renderer.sample

                    False ->
                        case Parser.parseBody <| String.split "\n" code of
                            Ok structure ->
                                Renderer.diagram structure

                            Err { row, reason } ->
                                Html.p []
                                    [ Html.text "Oops, something went wrong."
                                    , Html.pre []
                                        [ Html.text <| "Parse error at line " ++ String.fromInt row ++ ":\n" ++ Debug.toString reason
                                        ]
                                    ]
                ]
