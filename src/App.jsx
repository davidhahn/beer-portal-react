import React, { useEffect } from "react";
import './App.css';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');

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
      } else {
        console.log('No authorized account found');
      }
    } catch (error) {
      console.log(error);
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

        <button className="waveButton" onClick={null}>
          🍺 Me
        </button>
      </div>
    </div>
  );
}

export default App;

/*
export default function App() {

  const wave = () => {
    
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

        <button className="waveButton" onClick={wave}>
          🍺 Me
        </button>
      </div>
    </div>
  );
}
*/