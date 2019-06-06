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

import { Loader, Button, Card, Input, Heading, Table, Form } from 'rimble-ui';
import { Grid } from 'react-bootstrap';

import { zeppelinSolidityHotLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

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
      valueOfProductionAddress: '',
      valueOfProductionTown: '',

      productions: [],

      /////// Sample for displaying list（reference from rimble-ui document）
      values: [
        { transactionHash: '0xeb...cc0', ethAmount: '0.10 ETH' },
        { transactionHash: '0xsb...230', ethAmount: '0.11 ETH' },
        { transactionHash: '0xed...c40', ethAmount: '0.12 ETH' },
        { transactionHash: '0xge...a78', ethAmount: '0.13 ETH' },
      ],


      /////// IPFS
      ipfsHash:null,
      buffer:'',
      ethAddress:'',
      blockNumber:'',
      transactionHash:'',
      gasUsed:'',
      txReceipt: ''
    };

    this.handleInputProductionAddress = this.handleInputProductionAddress.bind(this);
    this.handleInputProductionTown = this.handleInputProductionTown.bind(this);
    this.sendProductionCreate = this.sendProductionCreate.bind(this);
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

  sendProductionCreate = async (event) => {
    const { accounts, asset, production_address, production_town, valueOfProductionAddress, valueOfProductionTown } = this.state;

    const response = await asset.methods.productionRegister(valueOfProductionAddress, valueOfProductionTown).send({ from: accounts[0] })

    console.log('=== response of productionRegister function ===', response);  // Debug

    const productionId = response.events.ProductionRegister.returnValues.id;

    this.setState({
      production_address: valueOfProductionAddress,
      production_town: valueOfProductionTown,
      valueOfProductionAddress: '',
      valueOfProductionTown: '',
    });

    ///// Add Production List
    this.state.productions.push({
      production_address: valueOfProductionAddress,
      production_town: valueOfProductionTown,
    });

    this.setState({
      productions: this.state.productions
    });


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

      this.setState({ ipfsHash: ipfsHash[0].hash });

      // asset.methods.sendHash(this.state.ipfsHash).send({
      //   from: accounts[0] 
      // }, (error, transactionHash) => {
      //   console.log(transactionHash);
      //   this.setState({ transactionHash });
      // });

      asset.methods.productionRegisterIpfsHash(productionId, this.state.ipfsHash).send({ 
        from: accounts[0]
      }).then((instance) => {
        console.log('=== instance ===', instance)
        //console.log('=== return value of _returnedIpfsHash ===', instance.events.productionRegisterIpfsHash.returnValues._returnedIpfsHash);
      });
    })
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
            <p>Test</p>
          </div>
        </div>
      )}
      </div>
    );
  }

  renderAsset() {
    const { production_address, production_town } = this.state;

    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.asset && (
        this.renderDeployCheck('asset')
      )}
      {this.state.web3 && this.state.asset && (
        <div className={styles.contracts}>
          <div className={styles.widgets}>
            <Card width={'420px'} bg="primary">
              <p>Address of Production</p>
              <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

              <p>Town of Production</p>
              <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

              <Button onClick={this.sendProductionCreate}>SEND（Production Register）</Button>
            </Card>


            <Card width={'420px'} bg="primary">
              <p>Address of Production</p>
              <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

              <p>Town of Production</p>
              <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

              <p>Image of Production</p>
              <input type = "file" onChange={ this.captureFile } />

              <Button onClick={this.sendProductionCreate}>SEND（Production Register）</Button>
            </Card>

            <Table>
              <thead>
                <tr>
                  <th>
                    Address of Production
                  </th>
                  <th>
                    Town of Production
                  </th>
                </tr>
              </thead>
              <tbody>
                {this.state.productions.map( (productions, i) => {
                  return <tr key={i}>
                           <td>{ productions.production_address }</td>
                           <td>{ productions.production_town }</td>
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

  render() {
    return (
      <div className={styles.App}>
        <Header />
          {this.state.route === '' && this.renderInstructions()}
          {this.state.route === 'counter' && this.renderBody()}
          {this.state.route === 'evm' && this.renderEVM()}
          {/* {this.state.route === 'faq' && this.renderFAQ()} */}
          {this.state.route === 'list' && this.renderList()}
          {this.state.route === 'asset' && this.renderAsset()}
        <Footer />
      </div>
    );
  }
}

export default App;
