module CodeLayout exposing (..)


type Utasítás
    = Utasítás String
    | Elágazás String (List Utasítás) (List Utasítás)
    | ElöltesztelősCiklus String (List Utasítás)
    | HátultesztelősCiklus String (List Utasítás)
