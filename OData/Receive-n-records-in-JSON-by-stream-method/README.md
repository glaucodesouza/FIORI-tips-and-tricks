# Steps to receive N records by JSON to internal table (easy)

# XXX IMPORTANT XXX
It works for receivin JSON records in sap, but can not give success answer.
Only give 500 error like: Invalid or no mapping to system data types found

## 1) in SEGW, Create Entity, Media=true
Create Entity, media=true

<img width="1442" height="343" alt="image" src="https://github.com/user-attachments/assets/e0196d99-6ce1-449f-94f9-debefa1fb00e" />

## 2) Create properties, does not need association nor navigation

<img width="1577" height="443" alt="image" src="https://github.com/user-attachments/assets/e91b1468-3db3-4b69-a873-cceae0c5532a" />

## 3) Redefine method create_stream
Write your code to convert the json file to internal table. See the method create_stream.

## 4) Make a test in 
- fill url with out entitySet
- choose POST method
- click use as request
- add header variable Content-Type=application/json
- optionally add header variable Accept=application/json
- fill body with your test data in JSON formmat
- Execute with a break-point

<img width="1608" height="855" alt="image" src="https://github.com/user-attachments/assets/08568fdd-3827-4381-be90-5ad7050c2f61" />
