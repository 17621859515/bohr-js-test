import { addressEncode,addressDecode } from "./mixins/mixin";
import { ajaxMethod } from "./mixins/request";
import { Key,Transaction,TransactionType,Network } from 'bohr-js';
import {BN} from 'bn.js';
import Long from "long";
import {Buffer} from "buffer";
import Web3 from 'web3'


let ethersProvider;
let hstFactory;
let piggybankFactory;
const baseApiUrl = "https://mainnetapi.bohrchain.com/v2.4.0/";


// Basic Actions Section
const getAccountsResults = document.getElementById('getAccountsResult');

const addressEncodeButton = document.getElementById('addressEncode');
const addressDecodeButton = document.getElementById('addressDecode');

const createKeyButton = document.getElementById('createKey');
const importPrivateKeyButton = document.getElementById('importPrivateKey');



// Send Section

const sendNum = document.getElementById("sendNum");
const sendAddress = document.getElementById("sendAddress");
const sendPrivateKey = document.getElementById("sendPrivateKey");
const transactionResult = document.getElementById("transactionResult");
const sendButton = document.getElementById('sendButton');
const sendBrc20Button = document.getElementById('sendBrc20Button');
const getBalanceBrc20Button = document.getElementById('getBalanceBrc20Button');




const toastWarp = document.getElementById("toastWarp");
const showToast = document.getElementById("showToast");
const showTips = document.getElementById("showTips");

const clickShowToast = (msg) => {
 showToast.innerHTML = msg;
 toastWarp.style.display = 'block';
};
toastWarp.onclick = async () => {
  toastWarp.style.display = 'none';
}
const clickShowTips = (msg) => {
  showTips.innerHTML = msg;
  showTips.style.display = 'block';
  setTimeout( function () {
    showTips.style.display = 'none';
  },1000);
};


// Miscellaneous

const initialize = async () => {

  console.log("initializeinitialize")

  let accounts;

  const initializeAccountButtons = () => {






    addressEncodeButton.onclick = async () => {
      try {
        var address ='0xd105cc651f0178b96fee8961a5ab357042baed5b'
        var addressBase58 =  addressEncode(address);

        getAccountsResults.innerHTML =
            "<div>addressEncode('"+ address + "')=" + addressBase58 + "</div>";
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    addressDecodeButton.onclick = async () => {
      try {
        var addressBase58 ='BfPChZmK4ahbtC2y11CQm2RwRfPCirKJvQM'
        var address =  addressDecode(addressBase58);

        getAccountsResults.innerHTML =
            "<div>addressDecode('"+ addressBase58 + "')=" + address + "</div>";
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    createKeyButton.onclick = async () => {
      try {
        var key = Key.generateKeyPair();
        var privateKeyStr ='0x'+ Buffer.from(key.getEncodedPrivateKey().buffer).toString("hex");
        var address ='0x'+ key.toAddressHexString()
        var addressBase58 =  addressEncode(key.toAddressHexString());

        getAccountsResults.innerHTML =
            "<div>privateKey:" + privateKeyStr + "</div>"+"<div>address:" + address + "</div>"+"<div>addressBase58:" + addressBase58 + "</div>";
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    importPrivateKeyButton.onclick = async () => {
      try {
        var privatekey = "302e020100300506032b65700422042045a87d0fac4af7ba3497c9943eeb92c17d73c92ec88edeab3c4a582a78e3ed61"
        var key = Key.importEncodedPrivateKey(Buffer.from(privatekey, "hex"));

        var privateKeyStr ='0x'+ Buffer.from(key.getEncodedPrivateKey().buffer).toString("hex");
        var address ='0x'+ key.toAddressHexString()
        var addressBase58 =  addressEncode(key.toAddressHexString());


        getAccountsResults.innerHTML =
            "<div>privateKey:" + privateKeyStr + "</div>"+"<div>address:" + address + "</div>"+"<div>addressBase58:" + addressBase58 + "</div>";
      } catch (err) {
        console.error(err);
        getAccountsResults.innerHTML = `Error: ${err.message}`;
      }
    };

    /**
     * Sending BR
     */

    sendButton.onclick = async () => {

      if(sendNum.value <= 0) {
        clickShowTips('Please input Amount');
        return;
      }
      if(sendAddress.value.length <35 && sendAddress.value.substring(0,1) !== 'B'  ) {
        clickShowTips('Please input Address');
        return;
      }
      if(sendPrivateKey.value.length <90 ) {
        clickShowTips('Please input Address');
        return;
      }

      var privateKey = sendPrivateKey.value;
      var toAddress =  addressDecode(sendAddress.value).substr(2) ;
      var nonce = "";
      var raw = "";
      var fromAddress = "";
      try {

        var amount = new BN(parseFloat(sendNum.value)*1E9);
        const TEST_V = {};

        TEST_V.key = Key.importEncodedPrivateKey(Buffer.from(privateKey, "hex"));

        fromAddress = '0x'+ TEST_V.key.toAddressHexString()

        const accountResultStr = await ajaxMethod(baseApiUrl+'account', {address:fromAddress},'get')
        const accountResult = JSON.parse(accountResultStr).result;
        nonce = accountResult.nonce;


        try {
          TEST_V.network = Network.MAINNET;
          TEST_V.type = TransactionType.TRANSFER;
          try {
            TEST_V.to = Buffer.from(toAddress, "hex");
          } catch (e) {
            console.log(JSON.stringify(e) + "to")
          }
          TEST_V.value = Long.fromString(amount.toString());// Long.fromString("12000000000");

          TEST_V.fee = Long.fromString("100000");
          TEST_V.gas = Long.fromString("0");
          TEST_V.gasPrice = Long.fromString("0");
          TEST_V.nonce = Long.fromString(nonce);
          TEST_V.timestamp = Long.fromString(`${(new Date()).getTime()}`);
          TEST_V.data = [];
        } catch (e) {
          console.log("" + JSON.stringify(e));
        }




        var tx = new Transaction(
            TEST_V.network,
            TEST_V.type,
            TEST_V.to,
            TEST_V.value,
            TEST_V.fee,
            TEST_V.gas,
            TEST_V.gasPrice,
            TEST_V.nonce,
            TEST_V.timestamp,
            TEST_V.data,
        );
        try {
          const txNew = tx.sign(TEST_V.key);
          raw = Buffer.from(txNew.toBytes().buffer).toString('hex')
        } catch (e) {
          console.log("" + JSON.stringify(e));
        }
      } catch (error) {
        console.log("" + JSON.stringify(error));
      }


      const contractDeployResult = await ajaxMethod(baseApiUrl+'broadcast-raw-transaction', {raw:raw},'get')
      const contractDeployInfo = JSON.parse(contractDeployResult);
      const hash = contractDeployInfo.result;
      console.log(contractDeployInfo)
      if(contractDeployInfo.success)
        transactionResult.innerHTML = 'transfer completed,transactionHash:<a target="_blank" href="'+baseApiUrl+'transaction-result?hash='+hash+'">'+hash+'</a>';
      else
        transactionResult.innerHTML = 'error:'+contractDeployResult+'';


    };

    /**
     * Sending Bo
     */

    sendBrc20Button.onclick = async () => {

      if(sendNum.value <= 0) {
        clickShowTips('Please input Amount');
        return;
      }
      if(sendAddress.value.length <35 && sendAddress.value.substring(0,1) !== 'B'  ) {
        clickShowTips('Please input Address');
        return;
      }
      if(sendPrivateKey.value.length <90 ) {
        clickShowTips('Please input Address');
        return;
      }

      //BO Bf5xCRoLWqzqSuzghTdeBskHDahVNR6ASUa,0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4
      var contractAddress =  "0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4";
      var privateKey = sendPrivateKey.value;
      var toAddress =  addressDecode(sendAddress.value);
      var nonce = "";
      var raw = "";
      var fromAddress = "";
      var decimal = 6;
      let gasLimit = "600000";
      let gasPrice = "10";
      try {

        var amount = new BN(parseFloat(sendNum.value)* Math.pow(10, decimal));
        const TEST_V = {};

        TEST_V.key = Key.importEncodedPrivateKey(Buffer.from(privateKey, "hex"));

        fromAddress = '0x'+ TEST_V.key.toAddressHexString()

        const accountResultStr = await ajaxMethod(baseApiUrl+'account', {address:fromAddress},'get')
        const accountResult = JSON.parse(accountResultStr).result;
        nonce = accountResult.nonce;

        var web3 = new Web3();
        // let res =web3.eth.abi.encodeFunctionSignature('transfer(address,uint256)')
        let res = "a9059cbb";
        console.log()
        let r = web3.eth.abi.encodeParameters(['address', 'uint256'], [toAddress, "800"]);
        console.log(r);
        let data = res + (r.replace("0x", ""));
        console.log(data);

        try {

          TEST_V.network = Network.MAINNET;
          TEST_V.type = TransactionType.CALL;
          TEST_V.to = Buffer.from(contractAddress.replace("0x", ''), "hex");
          TEST_V.value = Long.fromString("0");
          TEST_V.fee = Long.fromString("0");
          TEST_V.gas = Long.fromString(gasLimit);
          TEST_V.gasPrice = Long.fromString(gasPrice);
          TEST_V.nonce = Long.fromString(nonce);
          TEST_V.timestamp = Long.fromString(`${(new Date()).getTime()}`);
          TEST_V.data = Buffer.from(data, "hex");//Buffer.from("", "hex");//64617461
          var tx = new Transaction(
              TEST_V.network,
              TEST_V.type,
              TEST_V.to,
              TEST_V.value,
              TEST_V.fee,
              TEST_V.gas,
              TEST_V.gasPrice,
              TEST_V.nonce,
              TEST_V.timestamp,
              TEST_V.data,
          );
          const txNew = tx.sign(TEST_V.key);
          raw = Buffer.from(txNew.toBytes().buffer).toString('hex')
        } catch (error) {
          console.log(error)
        }

      } catch (error) {
        console.log("" + JSON.stringify(error));
      }


      const contractDeployResult = await ajaxMethod(baseApiUrl+'broadcast-raw-transaction', {raw:raw},'get')
      const contractDeployInfo = JSON.parse(contractDeployResult);
      const hash = contractDeployInfo.result;
      console.log(contractDeployInfo)
      if(contractDeployInfo.success)
        transactionResult.innerHTML = 'transfer completed,transactionHash:<a target="_blank" href="'+baseApiUrl+'transaction-result?hash='+hash+'">'+hash+'</a>';
      else
        transactionResult.innerHTML = 'error:'+contractDeployResult+'';


    };

    /**
     * balanceOf Bo
     */

    getBalanceBrc20Button.onclick = async () => {

      if(sendNum.value <= 0) {
        clickShowTips('Please input Amount');
        return;
      }
      if(sendAddress.value.length <35 && sendAddress.value.substring(0,1) !== 'B'  ) {
        clickShowTips('Please input Address');
        return;
      }
      if(sendPrivateKey.value.length <90 ) {
        clickShowTips('Please input Address');
        return;
      }

      //BO Bf5xCRoLWqzqSuzghTdeBskHDahVNR6ASUa,0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4
      var contractAddress =  "0x13cd83963e8f6a717b0c4b324cd4f88d6e5568f4";
      var decimal = 6;
      var toAddress =  addressDecode(sendAddress.value) ;
      console.log(toAddress)
      var web3 = new Web3();
      let approveFun =web3.eth.abi.encodeFunctionSignature('balanceOf(address)')
      let approveVallue = web3.eth.abi.encodeParameters(['address'], [toAddress]);
      let funStr = approveFun.replace("0x", "")+approveVallue.replace("0x", "");



      const contractDeployResult = await ajaxMethod(baseApiUrl+'local-call', {to:contractAddress,data:funStr},'get')
      const contractDeployInfo = JSON.parse(contractDeployResult);
      const returnData = contractDeployInfo.result.returnData;
      const ba = new BN(returnData.substr(2), 16).toNumber();
      const balance = ba/(Math.pow(10, decimal));

      console.log(contractDeployInfo)
      if(contractDeployInfo.success)
        transactionResult.innerHTML = 'balance: '+ balance;
      else
        transactionResult.innerHTML = 'error:'+contractDeployResult+'';


    };





  };

  initializeAccountButtons();


};

window.addEventListener('DOMContentLoaded', initialize);

function sleep(delay) {
  var start = (new Date()).getTime();
  while((new Date()).getTime() - start < delay) {
    continue;
  }
}
