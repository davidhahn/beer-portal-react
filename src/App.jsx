import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import './App.css';
import abi from './utils/BeerPortal.json';

// const CONTRACT_ADDRESS = '0x67F9a88BF7e659CCd8982AD2ce8E15215A9e908E';
// const CONTRACT_ADDRESS = '0x39d03F205446397039ea92c4f09a192b776Ce937';
// const CONTRACT_ADDRESS = '0xB5f3b483f22ee3cb991e3AfD2c4229869b1F449f';
// const CONTRACT_ADDRESS = '0xa61bEfC8AE7a656CD707a7660bBEb15BD1cBa6cb';
// const CONTRACT_ADDRESS = '0x3a43042A351230bC66127964A29b038F87437525';
const CONTRACT_ADDRESS = '0x6234Ef8910e7a3429FC099a5a0b16242da986413';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [isSuccessfulTxn, setIsSuccessfulTxn] = useState(false);
  const [allBeers, setAllBeers] = useState([]);
  const [beerMessage, setBeerMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        }, [])
          .sort((a, b) => b.timestamp - a.timestamp);

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

  const beer = async (event) => {
    event.preventDefault();
    
    try {
      setIsSubmitting(true);

      const { ethereum } = window;

      if (ethereum) {
        setIsSuccessfulTxn(false);

        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contractABI = abi.abi;
        console.log(signer);
        const beerPortalContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

        console.log(beerPortalContract);

        let count = await beerPortalContract.getTotalBeers();
        console.log("Retrieved total beer count...", count.toNumber());

        const beerTxn = await beerPortalContract.receiveBeer(beerMessage, { gasLimit: 300000 });
        console.log("Mining...", beerTxn.hash);

        await beerTxn.wait();
        console.log("Mined -- ", beerTxn.hash);
        console.log("Beer ", beerTxn);

        count = await beerPortalContract.getTotalBeers();
        console.log("Retrieved total beer count...", count.toNumber());

        handleOnSuccessTxn({ message: beerMessage, address: beerTxn.from, timestamp: (new Date).toLocaleString() });

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setBeerMessage('');
      setIsSubmitting(false);
    }
  }

  const handleOnSuccessTxn = (beerInfo) => {
    setIsSuccessfulTxn(true);
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    newBeerListener();
  }, []);

  const handleOnChange = (event) => {
    setBeerMessage(event.target.value);
  }

  const handleOnFocus = (event) => {
    setIsSuccessfulTxn(false);
  }

  const newBeerListener = () => {
    const onNewBeer = (address, message, timestamp) => {
      console.log('Incoming beer', address, message, timestamp);

      setAllBeers(prevState => [
        ...prevState,
        {
          address,
          timestamp: new Date(timestamp * 1000),
          message
        }
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractABI = abi.abi;

      const beerPortalContract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
      beerPortalContract.on('NewBeer', onNewBeer);
      console.log('new beer listener');
      console.log(beerPortalContract);

      return () => {
        if (beerPortalContract) {
          beerPortalContract.off('NewBeer', onNewBeer);
        }
      };
    }
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
        🍺 Hey there!
        </div>

        <div className="bio">
        Cheers!
        </div>
        {isSubmitting && (
          <div className="pouring">
            <img src="https://i.imgur.com/GQmhdCh.gif" />
          </div>
        )}
        {isSuccessfulTxn && (
          <div className="beeer">
            <img src="https://c.tenor.com/C-LgJxI1hbEAAAAd/iron-chef-secret-ingredient.gif" />
          </div>
        )}
        <form onSubmit={beer} className="beerForm">
          <section className="beerMessageSection">
            <label htmlFor="beerMessage" className="beerLabel">Message:</label>
            <input id="beerMessage" type="text" value={beerMessage} onChange={handleOnChange} className="beerMessage" onFocus={handleOnFocus} />
          </section>
          <input className="beerButton" type="submit" value={isSubmitting ? 'Pouring beer...' : '🍺 Me'} disabled={isSubmitting} />
        </form>
        {!currentAccount && (
          <button className="beerButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <h2>Bar Tab</h2>
        <div className="beersContainer">
          {allBeers.map((beer, index) => {
            return (
              <div key={index} className="beerContainer">
                <h3>{beer.message} 🍻</h3>
                <p>From: {beer.address}</p>
                <p>At: {beer.timestamp.toLocaleString()}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default App;