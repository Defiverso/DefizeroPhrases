document.addEventListener('DOMContentLoaded', () => {
  const CONTRACT_ADDRESS = "0x65ff57a722bd17Df77D297116aBe6bB3A2Aca507";
  const SEPOLIA_CHAIN_ID = "0xaa36a7";

  let provider;
  let signer;
  let contract;

  const connectBtn = document.getElementById('connect');
  const walletEl = document.getElementById('wallet');
  const actionsEl = document.getElementById('actions');
  const outputEl = document.getElementById('output');
  const networkWarningEl = document.getElementById('network-warning');

  async function checkNetwork() {
    if (!provider) return false;
    
    const network = await provider.getNetwork();
    if (network.chainId !== parseInt(SEPOLIA_CHAIN_ID, 16)) {
      networkWarningEl.classList.remove('hidden');
      actionsEl.classList.add('hidden');
      return false;
    } else {
      networkWarningEl.classList.add('hidden');
      actionsEl.classList.remove('hidden');
      return true;
    }
  }

  async function switchToSepolia() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://gateway.tenderly.co/public/sepolia'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network', addError);
          return false;
        }
      }
      console.error('Error switching to Sepolia', switchError);
      return false;
    }
  }

  connectBtn.onclick = async () => {
    if (provider && signer) {
      provider = null;
      signer = null;
      contract = null;
      walletEl.innerText = '';
      connectBtn.innerText = 'Connect Wallet';
      actionsEl.classList.add('hidden');
      networkWarningEl.classList.add('hidden');
      return;
    }

    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      
      const isSepolia = await checkNetwork();
      if (!isSepolia) {
        const switched = await switchToSepolia();
        if (!switched) {
          alert('Por favor, conecte-se à rede Sepolia para continuar');
          return;
        }
      }

      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      walletEl.innerText = `Connected: ${address}`;
      connectBtn.innerText = 'Disconnect Wallet';
      
      await checkNetwork();

      const response = await fetch('./abi.json');
      const abi = await response.json();
      contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    } else {
      alert('MetaMask not detected');
    }
  };

  if (window.ethereum) {
    window.ethereum.on('chainChanged', async () => {
      if (provider) {
        await checkNetwork();
      }
    });
  }

  const withNetworkCheck = (fn) => async (...args) => {
    if (!contract) return;
    const isSepolia = await checkNetwork();
    if (!isSepolia) {
      alert('Por favor, conecte-se à rede Sepolia para realizar esta ação');
      return;
    }
    return fn(...args);
  };

  window.setPhrase = withNetworkCheck(async function () {
    const phrase = document.getElementById('phraseInput').value.trim();
    
    if (!phrase) {
      alert('Por favor, insira uma frase antes de enviar.');
      return;
    }

    try {
      const tx = await contract.setPhrase(phrase);
      await tx.wait();
      alert('Phrase set successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to set phrase');
    }
  });

  window.deletePhrase = withNetworkCheck(async function () {
    try {
      const tx = await contract.deletePhrase();
      await tx.wait();
      alert('Phrase deleted');
    } catch (err) {
      console.error(err);
      alert('Failed to delete phrase');
    }
  });

  window.getMyPhrase = withNetworkCheck(async function () {
    try {
      const phrase = await contract.getMyPhrase();
      outputEl.innerHTML = `
        <div class="bg-gray-800 p-4 rounded shadow border border-gray-700">
          <p class="text-primary-light"><strong>My Phrase:</strong> ${phrase}</p>
        </div>`;
    } catch (err) {
      console.error(err);
      alert('Error retrieving your phrase');
    }
  });

  window.getAllPhrases = withNetworkCheck(async function () {
    try {
      const [addresses, phrases] = await contract.getAllPhrases();
      outputEl.innerHTML = '';

      for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];
        const phrase = phrases[i];

        const card = document.createElement('div');
        card.className = 'bg-gray-800 p-4 shadow rounded mb-2 border border-gray-700';
        card.innerHTML = `<p class="text-sm font-semibold text-primary-light">${addr}</p><p class="text-white">${phrase}</p>`;
        outputEl.appendChild(card);
      }
    } catch (err) {
      console.error(err);
      alert('Error retrieving all phrases');
    }
  });
});
