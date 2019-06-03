import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, Web3 } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Web3Info from "./components/Web3Info/index.js";
import CounterUI from "./components/Counter/index.js";
import Wallet from "./components/Wallet/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader, Button, Card, Input, Heading, Table } from 'rimble-ui';

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
    };

     //  <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

     //  <p>Town of Production</p>
     //  <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

     //  <Button onClick={this.sendProductionCreate}>SEND（ProductionCreate）</Button>

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

  sendProductionCreate = async () => {
    const { accounts, asset, production_address, production_town, valueOfProductionAddress, valueOfProductionTown } = this.state;

    const response = await asset.methods.productionRegister(valueOfProductionAddress, valueOfProductionTown).send({ from: accounts[0] })

    console.log('=== response of productionRegister function ===', response);  // Debug

    this.setState({
      production_address: valueOfProductionAddress,
      production_town: valueOfProductionTown,
      valueOfProductionAddress: '',
      valueOfProductionTown: '',
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
    const {} = this.state;

    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.asset && (
        this.renderDeployCheck('asset')
      )}
      {this.state.web3 && this.state.asset && (
        <div className={styles.contracts}>
          <h1>Asset Contract is good to Go!</h1>
          <div className={styles.widgets}>
            <p>Asset Test</p>
          </div>

          <div className={styles.widgets}>
            <Card width={'420px'} bg="primary">
              <p>Address of Production</p>
              <input type="text" value={this.state.valueOfProductionAddress} onChange={this.handleInputProductionAddress} />

              <p>Town of Production</p>
              <input type="text" value={this.state.valueOfProductionTown} onChange={this.handleInputProductionTown} />

              <Button onClick={this.sendProductionCreate}>SEND（ProductionCreate）</Button>
            </Card>
          </div>

          <Table>
            <thead>
              <tr>
                <th>
                  Transaction hash
                </th>
                <th>
                  Value
                </th>
                <th>
                  Recipient
                </th>
                <th>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  0xeb...cc0
                </td>
                <td>
                  0.10 ETH
                </td>
                <td>
                  0x4fe...581
                </td>
                <td>
                  March 28 2019 08:47:17 AM +UTC
                </td>
              </tr>
            </tbody>
          </Table>

          <br/>
          <br/>

          <Table>
            <thead>
              <tr>
                <th>
                  Transaction hash
                </th>
                <th>
                  Value
                </th>
                <th>
                  Recipient
                </th>
                <th>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  0xeb...cc0
                </td>
                <td>
                  0.10 ETH
                </td>
                <td>
                  0x4fe...581
                </td>
                <td>
                  March 28 2019 08:47:17 AM +UTC
                </td>
              </tr>
              <tr>
                <td>
                  0xsb...230
                </td>
                <td>
                  0.11 ETH
                </td>
                <td>
                  0x4gj...1e1
                </td>
                <td>
                  March 28 2019 08:52:17 AM +UTC
                </td>
              </tr>
              <tr>
                <td>
                  0xed...c40
                </td>
                <td>
                  0.12 ETH
                </td>
                <td>
                  0x3fd...781
                </td>
                <td>
                  March 28 2019 08:55:17 AM +UTC
                </td>
              </tr>
            </tbody>
          </Table>

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
