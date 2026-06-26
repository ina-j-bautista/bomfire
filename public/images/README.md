# Image Assets — Where to Place Your Files

Place your images in this folder (`/public/images/`) and they will be
served at `https://yoursite.com/images/filename.ext`.

## Required Images

| File                        | Used In                  | Description                                |
|-----------------------------|--------------------------|-------------------------------------------|
| `logo.png`              | NavBar (all pages)       | Your 3CS group logo — replaces "3CS" text  |
| `bomfire-logo.png`          | Landing page, About page | BOMFIRE product logo                       |
| `fire-decal.png`            | Landing page (right side)| Decorative fire illustration               |

## Team Photos (for About page)

| File                | Who                           | Label |
|---------------------|-------------------------------|-------|
| `team-ina.jpg`      | Sabrina "Ina" Bautista        | Ina   |
| `team-gen.jpg`      | Genro Gabriel D. Baldemor     | Gen   |
| `team-jude.jpg`     | Christian Jude J. Bermejo     | Jude  |
| `team-jacky.jpg`    | Jacqueline E. Imperial        | Jacky |

Photos will be displayed in a 80x80px circle crop.
Recommended: square JPG or PNG, at least 200x200px.

## How to enable images

After placing files here, open the relevant component and find the
comment block starting with `── IMAGE NAME ──`. Follow the instructions
inside the comment to swap from the text placeholder to the actual image.

All components have the image `<img>` tag pre-written inside a comment —
just uncomment it and delete the placeholder element.
