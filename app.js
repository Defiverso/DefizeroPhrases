let provider;
let signer;
let contract;

const CONTRACT_ADDRESS = "0x53532C976299cD2CdED50218aAAeec565D76fb7b";
const ABI = fetch("./abi.json")
  .then((res) => res.json())
  .then((abi) => init(abi));

async function init(abi) {
  document.getElementById("connect").onclick = async () => {
    if (window.ethereum) {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      document.getElementById("wallet").innerText = `Connected: ${address}`;
      contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    }
  };
}

async function setPhrase() {
  const phrase = document.getElementById("phraseInput").value;
  const tx = await contract.setPhrase(phrase);
  await tx.wait();
  alert("Phrase set!");
}

async function deletePhrase() {
  const tx = await contract.deletePhrase();
  await tx.wait();
  alert("Phrase deleted!");
}

async function getMyPhrase() {
  const phrase = await contract.getMyPhrase();
  document.getElementById("output").innerText = `Your phrase: ${phrase}`;
}

async function getAllPhrases() {
  if (!signer) {
    alert("Connect your wallet first");
    return;
  }
  const [users, phrases] = await contract.getAllPhrases();
  let result = "";
  for (let i = 0; i < users.length; i++) {
    result += `${users[i]}: ${phrases[i]}\n`;
  }
  document.getElementById("output").innerText = result;
}
