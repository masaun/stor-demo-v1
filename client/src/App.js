import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Web3Info from "./components/Web3Info/index.js";
import CounterUI from "./components/Counter/index.js";
import Wallet from "./components/Wallet/index.js";
import Instructions from "./components/Instructions/index.js";

import web3 from "web3";
import ipfs from './components/IPFS/ipfs';

/* Using for decoding IPFS hash */
import bs58 from "bs58"
import BN from "bn.js"

import { Loader, Button, Card, Input, Heading, Table, Form } from 'rimble-ui';
import { Grid } from 'react-bootstrap';

import { zeppelinSolidityHotLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';
import MapStyles from './components/Map/Map.module.css';

import SimpleMap from './components/Map/GoogleMapReact';  // Google Map API

import PieChart from 'react-minimal-pie-chart';  // Pie Chart（Circle graph）

import dotenv from 'dotenv'
dotenv.config()
//require('dotenv').config();
const MAP_API_KEY = process.env.MAP_API_KEY;
console.log('=== MAP_API_KEY ===', MAP_API_KEY);



class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      /////// Default state
      storageValue: 0,
      web3: null,
      accounts: null,
      contract: null,
      route: window.location.pathname.replace("/",""),

      /////// Value below is for productionCreate function
      production_address: '',
      production_town: '',
      timestamp_of_generation: 0,
      generation_sourse_type: '',
      transactionHash: '',   // Tx hash of productionCreate function
      valueOfProductionAddress: '',
      valueOfProductionTown: '',
      valueOfGenerationSourseType: '',

      productions: [],

      /////// Remaining Data
      co2_emissions_tracking: '125',
 
      /////// Sample for displaying list（reference from rimble-ui document）
      values: [
        { transactionHash: '0xeb...cc0', ethAmount: '0.10 ETH' },
        { transactionHash: '0xsb...230', ethAmount: '0.11 ETH' },
        { transactionHash: '0xed...c40', ethAmount: '0.12 ETH' },
        { transactionHash: '0xge...a78', ethAmount: '0.13 ETH' },
      ],

      /////// IPFS
      ipfsHash: '',
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: '',

      /////// Geo data（Coordinates）
      latitude: null,
      longitude: null,


      /////// Customer
      customer_address: '',
      valueOfCustomerAddress: '',

      customers: [],
    };

    this.handleInputProductionAddress = this.handleInputProductionAddress.bind(this);
    this.handleInputProductionTown = this.handleInputProductionTown.bind(this);
    this.handleInputGenerationSourseType = this.handleInputGenerationSourseType.bind(this);
    this.sendProductionCreate = this.sendProductionCreate.bind(this);

    this.handleInputCustomerAddress = this.handleInputCustomerAddress.bind(this);
    this.sendCustomerRegister = this.sendCustomerRegister.bind(this);
  }


  // state = {
  //   storageValue: 0,
  //   web3: null,
  //   accounts: null,
  //   contract: null,
  //   route: window.location.pathname.replace("/","")
  // };


  handleInputProductionAddress({ target: { value } }) {
    this.setState({ valueOfProductionAddress: value });
  }

  handleInputProductionTown({ target: { value } }) {
    this.setState({ valueOfProductionTown: value });
  }

  handleInputGenerationSourseType({ target: { value } }) {
    this.setState({ valueOfGenerationSourseType: value });
  }

  sendProductionCreate = async (event) => {
    const { accounts, asset, production_address, production_town, timestamp_of_generation, generation_sourse_type, valueOfProductionAddress, valueOfProductionTown,  valueOfGenerationSourseType, transactionHash, ipfsHash } = this.state;

    //////////////////////////////////////////////
    /// Execute productionRegister function
    //////////////////////////////////////////////
    const response = await asset.methods.productionRegister(valueOfProductionAddress, valueOfProductionTown,  valueOfGenerationSourseType).send({ from: accounts[0] })

    console.log('=== response of productionRegister function ===', response);  // Debug

    const Txhash = response.transactionHash
    console.log('=== Txhash of productionRegister function ===', Txhash);

    const productionId = response.events.ProductionRegister.returnValues.id;

    const generationTimestamp = response.events.ProductionRegister.returnValues.generationTimestamp;

    //////////////////////////////////////////////
    /// Integrate IPFS into sendProductionCreate function
    //////////////////////////////////////////////
    event.preventDefault();
   
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address
    const ethAddress = await asset.options.address;
    this.setState({ ethAddress });

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log('=== err ===');
      console.log('=== ipfsHash ===', ipfsHash);
      console.log('=== ipfsHash[0].hash ===', ipfsHash[0].hash);
      console.log('=== ipfsHash[0].hash typeof ===', typeof ipfsHash[0].hash);

      this.setState({ ipfsHash: ipfsHash[0].hash });

      /* Decoding IPFS hash */
      const hash = ipfsHash[0].hash
      //const hash = 'QmXGTaGWTT1uUtfSb2sBAvArMEVLK4rQEcQg5bv7wwdzwU'
      const hex = bs58.decode(hash).toString('hex')
      console.log('=== hex ===', hex) // 122084a644bfcb8639e1b1a1fc72fd0ad1826b91f7a9baa06ad409ac3c02b31f981b

      const n = new BN(hex, 16)
      console.log('=== n.toString(10) ===', n.toString(10)) // 537335293128262426148241029128274019001757729355677528305490323656269309818148891

      //asset.methods.productionRegisterIpfsHash(productionId, hex).send({
      asset.methods.productionRegisterIpfsHash(productionId, ipfsHash[0].hash).send({
        from: accounts[0]
      }).then((instance) => {
        console.log('=== ipfsHash[0].hash (in executing productionRegisterIpfsHash function) ===', ipfsHash[0].hash);
        console.log('=== instance ===', instance)
        console.log('=== event value of returnedIpfsHash ===', instance.events.ProductionRegisterIpfsHash.returnValues.returnedIpfsHash);
      });
    })

  
    //////////////////////////////////////////////
    /// Save data
    //////////////////////////////////////////////

    this.setState({
      production_address: valueOfProductionAddress,
      production_town: valueOfProductionTown,
      timestamp_of_generation: generationTimestamp,
      generation_sourse_type: valueOfGenerationSourseType,
      transactionHash: Txhash,
      valueOfProductionAddress: '',
      valueOfProductionTown: '',
      valueOfGenerationSourseType: '',
      ipfsHash: this.state.ipfsHash
    });

    ///// Add Production List
    this.state.productions.push({
      production_address: valueOfProductionAddress,
      production_town: valueOfProductionTown,
      timestamp_of_generation: generationTimestamp,
      generation_sourse_type: valueOfGenerationSourseType,
      transactionHash: Txhash,
      ipfsHash: this.state.ipfsHash
    });

    this.setState({
      productions: this.state.productions
    });

  }



  //////////////////
  ///// IPFS
  //////////////////
  captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()
    const file = event.target.files[0]
    let reader = new window.FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = () => this.convertToBuffer(reader)    
  };

  convertToBuffer = async(reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
    const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
    this.setState({ buffer });
  };

  onClick = async () => {
    try {
      this.setState({ blockNumber: "waiting.." });
      this.setState({ gasUsed: "waiting..." });

      // get Transaction Receipt in console on click
      // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt) => {
        console.log(err,txReceipt);
        this.setState({ txReceipt });
      }); //await for getTransactionReceipt

      await this.setState({ blockNumber: this.state.txReceipt.blockNumber });
      await this.setState({ gasUsed: this.state.txReceipt.gasUsed });    
    } catch (error) {
      console.log(error);
    } //catch
  } //onClick

  onSubmit = async (event) => {
    const { accounts, asset } = this.state;

    event.preventDefault();
   
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    const ethAddress = await asset.options.address;
    this.setState({ ethAddress });

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add 
    await ipfs.add(this.state.buffer, (err, ipfsHash) => {
      console.log('=== err, ipfsHash ===', err, ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash 
      this.setState({ ipfsHash: ipfsHash[0].hash });

      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      
      asset.methods.sendHash(this.state.ipfsHash).send({
        from: accounts[0] 
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({ transactionHash });
      });
    }) //await ipfs.add 
  }; //onSubmit 




  ///////////////////////////////////
  ///// Customer
  ///////////////////////////////////
  handleInputCustomerAddress({ target: { value } }) {
    this.setState({ valueOfCustomerAddress: value });
  }

  sendCustomerRegister = async () => {
    const { accounts, asset, customer_address, valueOfCustomerAddress } = this.state;

    const response = await asset.methods.customerRegister(valueOfCustomerAddress).send({ from: accounts[0] })

    console.log('=== response of customerRegister function ===', response);  // Debug


    this.setState({
      customer_address: valueOfCustomerAddress,
      valueOfProductionAddress: '',
    });

    ///// Add Customer List
    this.state.customers.push({
      customer_address: valueOfCustomerAddress,
    });

    this.setState({
      customers: this.state.customers
    });
  }




  //////////////////////////////////// 
  ///// Ganache
  ////////////////////////////////////
  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  componentDidMount = async () => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
    let Counter = {};
    let Wallet = {};
    let List = {};
    let Asset = {};  // To contract of Asset
    try {
      Counter = require("../../build/contracts/Counter.json");
      Wallet = require("../../build/contracts/Wallet.json");
      List = require("../../build/contracts/List.json");    // Load ABI of contract of List
      Asset = require("../../build/contracts/Asset.json");  // Load ABI of contract of Asset
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        let instance = null;
        let instanceWallet = null;
        let instanceList = null;
        let instanceAsset = null;  // To contract of Asset
        let deployedNetwork = null;
        if (Counter.networks) {
          deployedNetwork = Counter.networks[networkId.toString()];
          if (deployedNetwork) {
            instance = new web3.eth.Contract(
              Counter.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (Wallet.networks) {
          deployedNetwork = Wallet.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceWallet = new web3.eth.Contract(
              Wallet.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (List.networks) {
          deployedNetwork = List.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceList = new web3.eth.Contract(
              List.abi,
              deployedNetwork && deployedNetwork.address,
            );
            console.log('=== instanceList ===', instanceList);
          }
        }
        if (Asset.networks) {
          deployedNetwork = Asset.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceAsset = new web3.eth.Contract(
              Asset.abi,
              deployedNetwork && deployedNetwork.address,
            );
            console.log('=== instanceAsset ===', instanceAsset);
          }
        }
        if (instance || instanceWallet || instanceList || instanceAsset) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled,
            isMetaMask, contract: instance, wallet: instanceWallet, list: instanceList, asset: instanceAsset }, () => {
              this.refreshValues(instance, instanceWallet, instanceList, instanceAsset);
              setInterval(() => {
                this.refreshValues(instance, instanceWallet, instanceList, instanceAsset);
              }, 5000);
            });
        }
        else {
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }

    /***** [BEGIN] Display Map from TomTom Map API *****/
    // const script = document.createElement('script');
    // //script.src = '../public/sdk/tomtom.min.js';
    // script.src = process.env.PUBLIC_URL + '/sdk/tomtom.min.js';
    // document.body.appendChild(script);
    // script.async = true;
    // script.onload = function () {
    //   window.tomtom.L.map('map', {
    //     source: 'vector',
    //     key: "zzfvLaj8kWBmYRPl6rJqxpiKqKW91AV4",     // API-KEY sample
    //     //key: MAP_API_KEY,
    //     //key: '<your-api-key>',
    //     center: [37.769167, -122.478468],
    //     basePath: '/sdk',
    //     zoom: 15
    //   });
    // }
    /***** [END] Display Map from TomTom Map API *****/
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = (instance, instanceWallet, instanceList, instanceAsset) => {
    if (instance) {
      this.getCount();
    }
    if (instanceWallet) {
      this.updateTokenOwner();
    }
    if (instanceList) {
      console.log('refreshValues of instanceList');
    }
    if (instanceAsset) {
      console.log('refreshValues of instanceAsset');
    }
  }

  getCount = async () => {
    const { contract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getCounter().call();
    // Update state with the result.
    this.setState({ count: response });
  };

  updateTokenOwner = async () => {
    const { wallet, accounts } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await wallet.methods.owner().call();
    // Update state with the result.
    this.setState({ tokenOwner: response.toString() === accounts[0].toString() });
  };

  increaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.increaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  decreaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.decreaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  renounceOwnership = async (number) => {
    const { accounts, wallet } = this.state;
    await wallet.methods.renounceOwnership().send({ from: accounts[0] });
    this.updateTokenOwner();
  };

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey} accounts={this.state.accounts} />
      </div>
    );
  }

  renderBody() {
    const { hotLoaderDisabled, networkType, accounts, ganacheAccounts } = this.state;
    const updgradeCommand = (networkType === 'private' && !hotLoaderDisabled) ? "upgrade-auto" : "upgrade";
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.contract && (
          this.renderDeployCheck('counter')
        )}
        {this.state.web3 && this.state.contract && (
          <div className={styles.contracts}>
            <h1>Counter Contract is good to Go!</h1>
            <p>Interact with your contract on the right.</p>
            <p> You can see your account info on the left </p>
            <div className={styles.widgets}>
              <Web3Info {...this.state} />
              <CounterUI
                decrease={this.decreaseCount}
                increase={this.increaseCount}
                {...this.state} />
            </div>
            {this.state.balance < 0.1 && (
              <Instructions
                ganacheAccounts={ganacheAccounts}
                name="metamask"
                accounts={accounts} />
            )}
            {this.state.balance >= 0.1 && (
              <Instructions
                ganacheAccounts={this.state.ganacheAccounts}
                name={updgradeCommand}
                accounts={accounts} />
            )}
          </div>
        )}
      </div>
    );
  }

  renderInstructions() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name="setup" accounts={this.state.accounts} />
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.wrapper}>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name="faq" accounts={this.state.accounts} />
      </div>
    );
  }

  renderEVM() {
    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.wallet && (
        this.renderDeployCheck('evm')
      )}
      {this.state.web3 && this.state.wallet && (
        <div className={styles.contracts}>
          <h1>Wallet Contract is good to Go!</h1>
          <p>Interact with your contract on the right.</p>
          <p> You can see your account info on the left </p>
          <div className={styles.widgets}>
            <Web3Info {...this.state} />
            <Wallet
              renounce={this.renounceOwnership}
              {...this.state} />
          </div>
          <Instructions
            ganacheAccounts={this.state.ganacheAccounts}
            name="evm" accounts={this.state.accounts} />
        </div>
      )}
      </div>
    );
  }

  renderList() {
    const {} = this.state;

    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.list && (
        this.renderDeployCheck('list')
      )}
      {this.state.web3 && this.state.list && (
        <div className={styles.contracts}>
          <h1>List Contract is good to Go!</h1>
          <div className={styles.widgets}>
            <Card width={'420px'} bg="primary">
              <p>Address of Production</p>
              <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

              <p>Town of Production</p>
              <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

              <Button onClick={this.sendProductionCreate}>SEND（Production Register）</Button>
            </Card>

            <br />

            <Card width={'420px'} bg="primary">
              <p>Address of Customer</p>
              <input type="text" value={this.state.valueOfCustomerAddress} onChange={this.handleInputCustomerAddress} />

              <Button onClick={this.sendCustomerRegister}>SEND</Button>
            </Card>


            <br />


            <Table>
              <thead>
                <tr>
                  <th>
                    TRANSACTION HASH
                  </th>                
                  <th>
                    VALUE
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.values.map( (values, i) => {
                  return <tr key={i}>
                           <td>{ values.transactionHash }</td>
                           <td>{ values.ethAmount }</td>
                         </tr>
                })}
              </tbody>
            </Table>

            <br/>
            <br/>

            <Table>
              <thead>
                <tr>
                  <th>
                    Location
                  </th>                
                  <th>
                    Time-stamp of generation
                  </th>
                  <th>
                    Generation source type
                  </th>
                  <th>
                    CO2 Emissions tracking
                  </th>
                </tr>
              </thead>
              <tbody>
              </tbody>
            </Table>

            <br/>
            <br/>

            <Grid>
              <h3> Choose file to send to IPFS </h3>
              <Form onSubmit = { this.onSubmit }>
                <input 
                  type = "file"
                  onChange = { this.captureFile }
                />
                 <Button 
                 bsStyle="primary" 
                 type="submit"> 
                 Send it 
                 </Button>
              </Form>

              <hr/>
              <Button onClick = { this.onClick }> Get Transaction Receipt </Button>

              <Table bordered responsive>
                <thead>
                  <tr>
                    <th>Tx Receipt Category</th>
                    <th>Values</th>
                  </tr>
                </thead>
               
                <tbody>
                  <tr>
                    <td>IPFS Hash # stored on Eth Contract</td>
                    <td>{ this.state.ipfsHash }</td>
                  </tr>
                  <tr>
                    <td>Ethereum Contract Address</td>
                    <td>{ this.state.ethAddress }</td>
                  </tr>

                  <tr>
                    <td>Tx Hash # </td>
                    <td>{ this.state.transactionHash }</td>
                  </tr>

                  <tr>
                    <td>Block Number # </td>
                    <td>{ this.state.blockNumber }</td>
                  </tr>

                  <tr>
                    <td>Gas Used</td>
                    <td>{this.state.gasUsed}</td>
                  </tr>                
                </tbody>
              </Table>
            </Grid>

          </div>
        </div>
      )}
      </div>
    );
  }

  renderAsset() {
    const { production_address, production_town, timestamp_of_generation, generation_sourse_type, co2_emissions_tracking, transactionHash, ipfsHash } = this.state;
    //const { production_address, production_town, time_stamp_of_generation, generation_sourse_type, co2_emissions_tracking } = this.state;

    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.asset && (
        this.renderDeployCheck('asset')
      )}
      {this.state.web3 && this.state.asset && (
        <div style={{ display: "inline-flex" }}>
          <Card width={'200px'} bg="primary">
            <p style={{ fontSize: '10px'}}>Location / Address of Production</p>
            <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

            <p style={{ fontSize: '10px'}}>Location / Town of Production</p>
            <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

            <p style={{ fontSize: '10px'}}>Generation Sourse Type</p>
            <input type="text" value={this.state.valueOfGenerationSourseType} onChange={this.handleInputGenerationSourseType} />

            <p style={{ fontSize: '10px'}}>Image of Production</p>
            <input type = "file" onChange={ this.captureFile } />

            <span style={{ padding: "20px" }}></span>

            <Button onClick={this.sendProductionCreate} style={{ fontSize: '10px'}}>Production Register</Button>
          </Card>

          <span style={{ padding: "20px" }}></span>

          <Card width={'800px'} bg="primary">
            <Table>
              <thead>
                <tr>
                  <th style={{ fontSize: '9px'}}>
                    Tx Hash
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    IPFS Hash
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    Production Address
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    Production Town
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    Time-stamp of generation
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    Generation source type
                  </th>
                  <th style={{ fontSize: '9px'}}>
                    CO2 Emissions Tracking
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.productions.map( (productions, i) => {
                  return <tr key={i}>
                           <td>{ productions.transactionHash }</td>
                           <td>{ productions.ipfsHash }</td>                           
                           <td>{ productions.production_address }</td>
                           <td>{ productions.production_town }</td>
                           <td>{ productions.timestamp_of_generation }</td>
                           <td>{ productions.generation_sourse_type }</td>
                           <td>{ co2_emissions_tracking }</td>
                         </tr>
                })}
              </tbody>
            </Table>
          </Card>
        </div>
      )}
      </div>
    );
  }

  renderMap() {
    const { production_address, production_town, latitude, longitude } = this.state;

    ////// Geo data（Coordinates）by using Geolocation API 
    navigator.geolocation.getCurrentPosition(
      pos => console.log(
               '=== pos ===', pos, 
               '=== pos,coords ===', pos.coords, 
               '=== pos.coords.latitude ===', pos.coords.latitude,
               '=== pos.coords.longitude ===', pos.coords.longitude,
             ),
      err => console.log('=== err ===', err)
    );

    navigator.geolocation.getCurrentPosition(
      pos => this.setState({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => console.log('=== err ===', err)
    );

    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.asset && (
        this.renderDeployCheck('asset')
      )}
      {this.state.web3 && this.state.asset && (
        <div style={{ display: "inline-flex" }}>
          <Card width={'400px'} bg="primary">
            <h1>Traceability</h1>
            <h2>100 kw/h</h2>

            <br />

            <hr />

            <br />

            <h1>Today</h1>
            <p>Percentage that depend on type of renewable energy which is generated by the power of Wind, Water, Solar, Geothermal（%）</p>

            <PieChart
              data={[
                { title: 'Wind Power', value: 25, color: '#E38627' },
                { title: 'Water Power', value: 20, color: '#C13C37' },
                { title: 'Solar Power', value: 15, color: '#6A2135' },
                { title: 'Geothermal Power', value: 40, color: '#00FF00' },
              ]}
              style={{ height: '400px' }}  // Size of pie chart
              lineWidth={15}
              paddingAngle={5}
              lengthAngle={-360}

              label
              labelStyle={{
                //fontSize: '25px',
                fontSize: '5px',
                fontFamily: 'sans-serif'
              }}
              //labelPosition={0}
              labelPosition={60}

              animate // can use animation
            />
          </Card>

          <span style={{ padding: "20px" }}></span>

          <Card  width={'800px'} bg="primary">
            <div style={{ textAlign: "left" }}>
              <div>Latitude: { this.state.latitude }</div>
              <div>Longitude: { this.state.longitude }</div>
            </div>

            <SimpleMap />
          </Card>
        </div>
      )}
      </div>
    );
  }


  render() {
    return (
      <div className={styles.App}>
        <Header />
          {/* {this.state.route === '' && this.renderInstructions()} */}
          {/* {this.state.route === 'counter' && this.renderBody()} */}
          {/* {this.state.route === 'evm' && this.renderEVM()} */}
          {/* {this.state.route === 'faq' && this.renderFAQ()} */}
          {this.state.route === 'list' && this.renderList()}
          {this.state.route === 'asset' && this.renderAsset()}
          {this.state.route === 'map' && this.renderMap()}
        <Footer />
      </div>
    );
  }
}

export default App;
