# Events Management Service

A simple DFINITY Canister smart contract for managing events.

Steps to run this canister (Make sure dfx is installed):

- dfx start --clean --background
- npm i --force
- dfx generate
- dfx deploy

Go to the URL that pops up in the terminal to see all the available functions.
Please note down the canister ID and export it by running command:  export CANISTER_ID_EVENTS=<CANISTER ID>

Also, copy the src/declarations directory to evenity/src [FRONTEND APP]
Now follow the steps from evenity repository