import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/BeerPortal.json';

// const CONTRACT_ADDRESS = '0x67F9a88BF7e659CCd8982AD2ce8E15215A9e908E';
const CONTRACT_ADDRESS = '0x39d03F205446397039ea92c4f09a192b776Ce937';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isSuccessfulTxn, setIsSuccessfulTxn] = useState('');
  const [allBeers, setAllBeers] = useState([]);

  const getAllBeers = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contractAddress = CONTRACT_ADDRESS;
        const contractABI = abi.abi;
        const beerPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const beers = await beerPortalContract.getAllBeers();

        console.log(beers);

        const serializedBeer = beers.reduce((serialized, beer) => {
          serialized.push({
            address: beer.bartender,
            message: beer.message,
            timestamp: new Date(beer.timestamp * 1000),
          });

          return serialized;
        }, []);

        console.log('serialized beer', serializedBeer);

        setAllBeers(serializedBeer);
      } else {
        console.log('Ethereum object doesn\'t exist!');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log('Make sure you have Metamask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
        
        await getAllBeers();
        console.log(allBeers);

      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }

  const beer = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contractABI = abi.abi;
        const beerPortalContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        console.log(beerPortalContract);

        let count = await beerPortalContract.getTotalBeers();
        console.log("Retrieved total beer count...", count.toNumber());

        const beerTxn = await beerPortalContract.receiveBeer('Cheers!');
        console.log("Mining...", beerTxn.hash);

        await beerTxn.wait();
        console.log("Mined -- ", beerTxn.hash);

        setIsSuccessfulTxn(true);

        count = await beerPortalContract.getTotalBeers();
        console.log("Retrieved total beer count...", count.toNumber());

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        🍺 Hey there!
        </div>

        <div className="bio">
        Cheers!
        </div>
        {isSuccessfulTxn && (
          <div className="beeer">
            <img src="https://c.tenor.com/C-LgJxI1hbEAAAAd/iron-chef-secret-ingredient.gif" />
          </div>
        )}

        <button className="beerButton" onClick={beer}>
          🍺 Me
        </button>
        {!currentAccount && (
          <button className="beerButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="beersContainer">
          <h2>Bar Tab</h2>
          {allBeers.map((beer, index) => {
            return (
              <div key={index} className="beerContainer">
                <h3>Address: {beer.address}</h3>
                <p>Message: {beer.message}</p>
                <p>Time: {beer.timestamp.toString()}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default App;