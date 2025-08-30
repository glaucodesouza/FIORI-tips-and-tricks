# Steps to receive N records by JSON to internal table (easy)

## 1 in SEGW, Create Entity, Media=true
Create Entity, media=true

<img width="1442" height="343" alt="image" src="https://github.com/user-attachments/assets/e0196d99-6ce1-449f-94f9-debefa1fb00e" />

## 2 Create properties, does not need association nor navigation

<img width="1577" height="443" alt="image" src="https://github.com/user-attachments/assets/e91b1468-3db3-4b69-a873-cceae0c5532a" />

## 3 Redefine method create_stream
Here you code to convert the json file to internal table. See the method create_stream.
