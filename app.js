document.addEventListener('DOMContentLoaded', () => {
  const CONTRACT_ADDRESS = "0x65ff57a722bd17Df77D297116aBe6bB3A2Aca507";

  let provider;
  let signer;
  let contract;

  const connectBtn = document.getElementById('connect');
  const walletEl = document.getElementById('wallet');
  const actionsEl = document.getElementById('actions');
  const outputEl = document.getElementById('output');

  connectBtn.onclick = async () => {
    if (provider && signer) {
      provider = null;
      signer = null;
      contract = null;
      walletEl.innerText = '';
      connectBtn.innerText = 'Connect Wallet';
      actionsEl.classList.add('hidden');
      return;
    }

    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      walletEl.innerText = `Connected: ${address}`;
      connectBtn.innerText = 'Disconnect Wallet';
      actionsEl.classList.remove('hidden');

      const response = await fetch('./abi.json');
      const abi = await response.json();
      contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    } else {
      alert('MetaMask not detected');
    }
  };

  window.setPhrase = async function () {
    const phrase = document.getElementById('phraseInput').value;
    if (!contract) return;
    try {
      const tx = await contract.setPhrase(phrase);
      await tx.wait();
      alert('Phrase set successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to set phrase');
    }
  }

  window.deletePhrase = async function () {
    if (!contract) return;
    try {
      const tx = await contract.deletePhrase();
      await tx.wait();
      alert('Phrase deleted');
    } catch (err) {
      console.error(err);
      alert('Failed to delete phrase');
    }
  }

  window.getMyPhrase = async function () {
    if (!contract) return;
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
  }

  window.getAllPhrases = async function () {
    if (!contract) return;
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
  }
});
