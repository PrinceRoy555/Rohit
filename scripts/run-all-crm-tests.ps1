$env:JAVA_HOME="C:\Users\ASUS\AppData\Local\Programs\EclipseAdoptium\jdk-21.0.13+9"
$env:FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"
Set-Location "C:\Users\ASUS\OneDrive\Desktop\rohitwork"

npx.cmd firebase-tools emulators:exec --only firestore --project rohit-72bfa "node scripts/run-all-crm-tests.cjs"
