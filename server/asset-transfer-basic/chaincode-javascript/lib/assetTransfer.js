"use strict";

// Deterministic JSON.stringify()
const stringify = require("json-stringify-deterministic");
const sortKeysRecursive = require("sort-keys-recursive");
const { Contract } = require("fabric-contract-api");

class AssetTransfer extends Contract {
  async InitLedger(ctx) {
    const assets = [
      {
        id: "asset1",
        owner: "Tom",
        borderCoordinates: [
          [19.12133355062022, 72.83064707408777],
          [19.12137299965453, 72.8383030263863],
          [19.116285704382088, 72.83817835440408],
          [19.116206801532657, 72.8296171058426],
        ],
        appraisedValue: "300",
      },

      {
        id: "asset2",
        owner: "Brad",
        borderCoordinates: [
          [19.12140817920624, 72.83829867839815],
          [19.116329334109377, 72.83818602561952],
          [19.116693348656206, 72.84202694892885],
          [19.118383099078706, 72.84189820289613],
        ],
        appraisedValue: "500",
      },

      {
        id: "asset3",
        owner: "Jerry",
        borderCoordinates: [
          [19.11844294105395, 72.84190356731416],
          [19.121463979847313, 72.83828258514406],
          [19.124873029106656, 72.83884048461915],
          [19.122432395175974, 72.8412973880768],
        ],
        appraisedValue: "700",
      },

      {
        id: "asset4",
        owner: "John",
        borderCoordinates: [
          [19.121322965264117, 72.83067047595979],
          [19.124890242729872, 72.83884584903718],
          [19.12140883106099, 72.83829867839815],
        ],
        appraisedValue: "900",
      },

      {
        id: "asset5",
        owner: "Frank",
        borderCoordinates: [
          [19.121322965264117, 72.83067047595979],
          [19.124890242729872, 72.83884584903718],
          [19.12680168334748, 72.838990688323],
          [19.125430095767292, 72.83201694488527],
        ],
        appraisedValue: "1000",
      },
      {
        id: "asset6",
        owner: "Michael",
        borderCoordinates: [
          [19.124890242729872, 72.83884584903718],
          [19.122462603384808, 72.8412920236587],
          [19.12745001730219, 72.84142613410951],
          [19.12680168334748, 72.838990688323],
        ],
        appraisedValue: "1200",
      },
    ];

    for (const asset of assets) {
      asset.docType = "asset";
      asset.borderCoordinates = JSON.stringify(asset.borderCoordinates);
      await ctx.stub.putState(asset.id, Buffer.from(stringify(sortKeysRecursive(asset))));
    }
  }

  // CreateAsset issues a new asset to the world state with given details.
  async CreateAsset(ctx, id, owner, borderCoordinates, appraisedValue) {
    // console.log("borderCoordinates", borderCoordinates);
    const exists = await this.AssetExists(ctx, id);
    if (exists) {
      throw new Error(`The asset ${id} already exists`);
    }

    const asset = {
      id: id,
      owner: owner,
      borderCoordinates: borderCoordinates,
      appraisedValue: appraisedValue,
    };
    //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    return JSON.stringify(asset);
  }

  // ReadAsset returns the asset stored in the world state with given id.
  async ReadAsset(ctx, id) {
    const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
    if (!assetJSON || assetJSON.length === 0) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return assetJSON.toString();
  }

  // UpdateAsset updates an existing asset in the world state with provided parameters.
  async UpdateAsset(ctx, id, owner, borderCoordinates, appraisedValue) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }

    // overwriting original asset with new asset
    const updatedAsset = {
      id: id,
      owner: owner,
      borderCoordinates: borderCoordinates,
      appraisedValue: appraisedValue,
    };
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
  }

  // DeleteAsset deletes an given asset from the world state.
  async DeleteAsset(ctx, id) {
    const exists = await this.AssetExists(ctx, id);
    if (!exists) {
      throw new Error(`The asset ${id} does not exist`);
    }
    return ctx.stub.deleteState(id);
  }

  // AssetExists returns true when asset with given ID exists in world state.
  async AssetExists(ctx, id) {
    const assetJSON = await ctx.stub.getState(id);
    return assetJSON && assetJSON.length > 0;
  }

  // TransferAsset updates the owner field of asset with given id in the world state.
  async TransferAsset(ctx, id, newOwner) {
    const assetString = await this.ReadAsset(ctx, id);
    const asset = JSON.parse(assetString);
    const oldOwner = asset.Owner;
    asset.Owner = newOwner;
    // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
    await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
    return oldOwner;
  }

  // GetAllAssets returns all assets found in the world state.
  async GetAllAssets(ctx) {
    const allResults = [];
    // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
    const iterator = await ctx.stub.getStateByRange("", "");
    let result = await iterator.next();
    while (!result.done) {
      const strValue = Buffer.from(result.value.value.toString()).toString("utf8");
      let record;
      try {
        record = JSON.parse(strValue);
      } catch (err) {
        console.log(err);
        record = strValue;
      }
      allResults.push(record);
      result = await iterator.next();
    }
    return JSON.stringify(allResults);
  }
}

module.exports = AssetTransfer;
