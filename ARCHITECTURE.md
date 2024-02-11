# Architecture

## xBrowserSync
### Datastructure
```jsonc
[
    {
        "title": "[xbs] Other",
        "id": 1,
        "children": [
            {
                "title": "Google",
                "url": "https://www.google.de/",
                "id": 2,
                "tags": [
                    "asdf"
                ]
            }
        ]
    },
    {
        "id": 3,
        "title": "Test",
        "description": "Hello World",
        "url": "https://duckduckgo.org",
        "tags": [
            "asdf"
        ]
    },
    {
        "id": 4,
        "title": "Test",
        "description": "Hello World",
        "url": "https://duckduckgo.org"
    },
    {
        "id": 5,
        "title": "Test",
        "description": "Hello World",
        "url": "https://duckduckgo.org"
    }
]
```

-   the root of the data structure is an array of `(Bookmark | Folder)[]`
    although **there should not be any bookmarks saved in the root array !!!**
-   there are two types of data: **folders** and **bookmarks**
-   all items (folders and bookmarks) have a serial id
-   A **Bookmark** has the following data structure
    ```ts
    interface Bookmark {
        id          : number,
        title       : string | undefined,   // Option<string>
        description : string | undefined,   // Option<string>
        url         : string,
        tags        : string[] | undefined  // default to empty array
    }
    ```

    **Special Cases:**  
    A special case of a bookmark is a "separator". This is a bookmark with
    only an `id` and  `title: "-"`.

-   A **folder** has the following data structure
    ```ts
    interface Folder {
        id          : number,
        title       : string | undefined,   // Option<string>
        children    : (Folder | Bookmark)[] // default to empty array
    }
    ```

    **Special Cases:**  
    Folders can be empty (no children; `children: []`) or have no title
    (`title: ""`).

-   xBrowserSync stores the bookmarks in the following default folders:
    - `title = "[xbs] Toolbar"`
    - `title = "[xbs] Other"`
    - `title = "[xbs] Menu"`


-   The xBrowserSync plugin cannot edit bookmarks in the root array.
