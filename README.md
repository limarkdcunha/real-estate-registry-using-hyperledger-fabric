# Real estate registry using Hyperledger fabric

## Setting up frontend

In the project directory, in the client just run npm install.\
It will install the node modules and run the react application\
Then run ### `npm start`\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Setting up backend and Hyperledger fabric

1. Firstly setup the hyperledger fabric using fabric samples repository.
   To do so in your windows please refer [this link](https://www.codementor.io/@arvindmaurya/hyperledger-fabric-on-windows-1hjjorw68p)

2. After setting up hyperledger fabric for the first time stop using ### `./network.sh up` to start the network/
   Instead follow the steps mentioned next./
   Type ### `cd fabric-samples/test-network` in terminal (WSL Ubuntu terminal) to **test-network** subdirectory within your local clone of the **fabric-samples** repository./
   Then ### `./network.sh down**`
   Then type ### `./network.sh up createChannel -c mychannel -ca` to start the network and create the channel/

   **Before this step please complete step **3** first.**

   Then type ### `./network.sh deployCC -ccn basic -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript` to deploy the chaincode on our hyperledger network/

   Then open a new terminal and type ### `cd asset-transfer-basic/application-javascript`/
   Install required node modules using npm i/
   Then type ### `node app.js` to start the server side application./

   If you get no error during these steps then you nodejs app integrated with hyperledger fabric should be up and running on port 5000.

   Please refer to this [link](https://hyperledger-fabric.readthedocs.io/en/release-2.2/write_first_app.html#:~:text=Install%20Homebrew.,Run%20npm%20install%20.) for any issues in **Step 2**.

3. In your **fabric-samples** repository change **asset-transfer-basic** directory with the directory provided in this repository (or you can just change the different files).

4. Steps **1** and **3** have to done only once however step **2** (including sub steps) has to carried out every time

## About

### API endpoints

http://localhost:5000/getAllAssets [get]: returns all the records stored in blockchain.\
http://localhost:5000/getAsset/{id} [get]: returns a record by its id\
http://localhost:5000/updateAsset/{id} [patch]: update values of a record\
http://localhost:5000/createAsset [post]: create a record on the blockchain\
http://localhost:5000/transferAsset [patch]: transfers the ownership of the asset\
http://localhost:5000/assetExsists [get]: checks if the record is the present on the blockchain

### Chaincode (Land ) Schema has four attributes here

Id: String\
Appraised value: String\
BorderCoordinates: 2D array\
Owner Names: String

#### Example body to be used during sending post request

{\
"id":"asset600",\
"borderCoordinates":\
[\
[19.121322965264117, 72.83067047595979],\
[19.124890242729872, 72.83884584903718],\
[19.12140883106099, 72.83829867839815]\
],\
"owner":"George",\
"appraisedValue":"20000"\
}

## Refiner

There is also a great **data query tool** connected with both frontend and backend which syncs with hyperleder fabric periodically,fetches its data and stores it in a relational database and allows us to perform rich relational queries on hyperledger data which is not possible with SDK interfaces

To set it up refer to this [link](https://github.com/FujitsuLaboratories/Ledger-Data-Refiner).
