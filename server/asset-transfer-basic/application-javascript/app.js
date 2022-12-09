"use strict";

const { Gateway, Wallets } = require("fabric-network");
const FabricCAServices = require("fabric-ca-client");
const path = require("path");
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require("../../test-application/javascript/CAUtil.js");
const { buildCCPOrg1, buildWallet } = require("../../test-application/javascript/AppUtil.js");

const channelName = "mychannel";
const chaincodeName = "basic";
const mspOrg1 = "Org1MSP";
const walletPath = path.join(__dirname, "wallet");
const org1UserId = "appUser";

var contract;
// var contract2;

//Express app
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 5000;

app.listen(PORT, () => console.log(`Server running at ${PORT}`));
app.use(express.json());
app.use(cors());

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

async function main() {
  try {
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(FabricCAServices, ccp, "ca.org1.example.com");
    const wallet = await buildWallet(Wallets, walletPath);

    await enrollAdmin(caClient, wallet, mspOrg1);
    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, "org1.department1");

    const gateway = new Gateway();

    try {
      await gateway.connect(ccp, {
        wallet,
        identity: org1UserId,
        discovery: { enabled: true, asLocalhost: true }, // using asLocalhost as this gateway is using a fabric network deployed locally
      });

      // Build a network instance based on the channel where the smart contract is deployed
      const network = await gateway.getNetwork(channelName);

      // Get the contract from the network.
      contract = network.getContract(chaincodeName);
      // contract2 = network.getContract("basic2");

      console.log("\n--> Initializing ledger ");
      await contract.submitTransaction("InitLedger");
      // await contract2.submitTransaction("InitLedger");
      console.log("** Result: committed");

      // const result = await contract.submitTransaction("CreateAsset", "asset6", "Tom", JSON.stringify(borderCoordinates), "1300");
      // console.log("*** Asset created");
    } finally {
      // gateway.disconnect();
      console.log("End");
    }
  } catch (error) {
    console.error(`** FAILED to run the application: ${error}`);
  }
}
main();

//   id: "asset1",
//   owner: "Tom",
//   borderCoordinates: [
//     [19.12133355062022, 72.83064707408777],
//     [19.12137299965453, 72.8383030263863],
//     [19.116285704382088, 72.83817835440408],
//     [19.116206801532657, 72.8296171058426],
//   ],
//   AppraisedValue: 300,
//Create
app.post("/createAsset", async function (req, res) {
  const id = req.body.id;
  const owner = req.body.owner;
  const borderCoordinates = JSON.stringify(req.body.borderCoordinates);
  const appraisedValue = req.body.appraisedValue;

  try {
    const result = await contract.submitTransaction("CreateAsset", id, owner, borderCoordinates, appraisedValue);
    return res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Read all
app.get("/getAllAssets", async function (req, res) {
  try {
    const result = await contract.evaluateTransaction("GetAllAssets");
    return res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Read an asset using asset ID
app.get("/getAsset/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const result = await contract.evaluateTransaction("ReadAsset", id);
    // console.log("read ", JSON.parse(result.toString()));
    return res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/assetExists/:id", async function (req, res) {
  try {
    const id = req.params.id;
    const result = await contract.evaluateTransaction("AssetExists", id);
    return res.status(200).json(JSON.parse(result.toString()));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

//Update
app.patch("/updateAsset", async function (req, res) {
  const id = req.body.id;
  const owner = req.body.owner;
  const borderCoordinates = JSON.stringify(req.body.borderCoordinates);
  const appraisedValue = req.body.appraisedValue;

  try {
    const result = await contract.evaluateTransaction("AssetExists", id);
    const value = JSON.parse(result.toString());
    if (value) {
      await contract.submitTransaction("UpdateAsset", id, owner, borderCoordinates, appraisedValue);
    } else {
      return res.status(500).json({ message: "Asset does not exist" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json({ message: "Asset updated" });
});

//Transfer Ownership
app.patch("/transferAsset", async (req, res) => {
  const id = req.body.id;
  const newOwner = req.body.newOwner;

  try {
    await contract.submitTransaction("TransferAsset", id, newOwner);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json({ message: "Asset transferred" });
});

//Delete
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await contract.submitTransaction("DeleteAsset", id);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json({ message: "Asset deleted" });
});
