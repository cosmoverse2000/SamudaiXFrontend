import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';
import { FaKey, FaSignInAlt } from 'react-icons/fa';


const Login = () => {
    const domain = window.location.host;
    const origin = window.location.origin;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const [isSignUp, setSignUp] = useState(false);



    // const profileElm = document.getElementById('profile');
    // const noProfileElm = document.getElementById('noProfile');
    // const welcomeElm = document.getElementById('welcome');
    const profileElm = useRef(null);
    const noProfileElm = useRef(null);
    const welcomeElm = useRef(null);

    const ensLoaderElm = useRef(null);
    const ensContainerElm = useRef(null);
    const ensTableElm = useRef(null);

    const nftElm = useRef(null);

    const nftLoaderElm = useRef(null);
    const nftContainerElm = useRef(null);
    const nftTableElm = useRef(null);

    const ensAddr = "https://api.thegraph.com/subgraphs/name/ensdomains/ens";
    const tablePrefix = `<tr><th>ENS Text Key</th><th>Value</th></tr>`;

    let address;

    const BACKEND_ADDR = "http://localhost:3000";

    async function createSiweMessage(address, statement) {
        const res = await fetch(`${BACKEND_ADDR}/nonce`, {
            credentials: 'include',
        });
        const message = new SiweMessage({
            domain,
            address,
            statement,
            uri: origin,
            version: '1',
            chainId: 5,
            nonce: await res.text()
        });
        return message.prepareMessage();
    }

    function connectWallet() {
        provider.send('eth_requestAccounts', [])
            .catch(() => console.log('user rejected request'));
    }

    async function getENSMetadata(ensName) {
        const body = JSON.stringify({
            query: `{
        domains(where:{ name: "${ensName}" }) {
            name
            resolver {
                texts
            }
        }
    }`
        });

        let res = await fetch(ensAddr, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body
        });

        const wrapper = await res.json();
        const { data } = wrapper;
        const { domains } = data;
        let textKeys = [];
        for (let i = 0, x = domains.length; i < x; i++) {
            let domain = domains[i];
            if (domain.name === ensName) {
                textKeys = domain.resolver.texts;
                break;
            }
        }
        const resolver = await provider.getResolver(ensName);

        let nextProfile = `<tr><td>name:</td><td>${ensName}</td></tr>`;
        for (let i = 0, x = textKeys.length; i < x; i++) {
            nextProfile += `<tr><td>${textKeys[i]}:</td><td>${await resolver.getText(textKeys[i])}</td></tr>`
        }

        return tablePrefix + nextProfile
    }
    async function signInWithEthereum() {
        profileElm.current.classList.add('hidden');
        noProfileElm.current.classList.add('hidden');
        welcomeElm.current.classList.add('hidden');

        setSignUp(false);
        address = await signer.getAddress()
        const message = await createSiweMessage(
            address,
            'Sign in with Ethereum to the app.'
        );
        const signature = await signer.signMessage(message);

        const res = await fetch(`${BACKEND_ADDR}/verify`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, signature }),
            credentials: 'include'
        });

        if (!res.ok) {
            console.error(`Failed in getInformation: ${res.statusText}`);
            return
        }
        console.log(await res.text());
        displayENSProfile();
        displayNFTs();
    }

    async function getInformation() {
        const res = await fetch(`${BACKEND_ADDR}/personal_information`, {
            credentials: 'include',
        });

        if (!res.ok) {
            console.error(`Failed in getInformation: ${res.statusText}`);
            return
        }

        let result = await res.text();
        console.log(result);
        address = result.split(" ")[result.split(" ").length - 1];

        displayENSProfile();
        displayNFTs();
    }

    async function displayENSProfile() {
        const ensName = await provider.lookupAddress(address);

        if (ensName) {
            profileElm.current.classList.remove('hidden');

            welcomeElm.current.innerHTML = `Hello, ${ensName}`;

            let avatar = await provider.getAvatar(ensName);
            if (avatar) {
                welcomeElm.current.innerHTML += ` <img class="avatar" src=${avatar}/>`;
            }

            ensLoaderElm.current.innerHTML = 'Loading ENS Data...';
            ensTableElm.current.innerHTML = await getENSMetadata(ensName);
            ensLoaderElm.current.innerHTML = '';
            ensContainerElm.current.classList.remove('hidden');
        } else {
            welcomeElm.current.innerHTML = `Hello, ${address}`;
            noProfileElm.current.classList.remove('hidden');
        }

        welcomeElm.current.classList.remove('hidden');
    }

    function makeOpenSeaURL() {
        return `https://testnets-api.opensea.io/api/v1/assets?owner=${address}`
    }

    async function getNFTs() {
        try {
            let res = await fetch(makeOpenSeaURL());
            if (!res.ok) {
                throw new Error(res.statusText)
            }

            let body = await res.json();

            if (!body.assets || !Array.isArray(body.assets) || body.assets.length === 0) {
                return []
            }

            return body.assets.map((asset) => {
                let { name, asset_contract, token_id } = asset;
                let { address } = asset_contract;
                return { name, address, token_id };
            });
        } catch (err) {
            console.error(`Failed to resolve nfts: ${err.message}`);
            return [];
        }
    }

    async function displayNFTs() {
        nftLoaderElm.current.innerHTML = 'Loading NFT Ownership...';
        nftElm.current.classList.remove('hidden');

        let nfts = await getNFTs();
        if (nfts.length === 0) {
            nftLoaderElm.current.innerHTML = 'No NFTs found';
            return;
        }

        let tableHtml = "<tr><th>Name</th><th>Address</th><th>Token ID</th></tr>";
        nfts.forEach((nft) => {
            tableHtml += `<tr><td>${nft.name}</td><td>${nft.address}</td><td>${nft.token_id}</td></tr>`
        });

        nftTableElm.current.innerHTML = tableHtml;
        nftContainerElm.current.classList.remove('hidden');
        nftLoaderElm.current.innerHTML = '';
    }






    return (<div>

        <h1>Welcome! LogIn Please :<FaKey /> </h1>
        <div className='loginStep'>
            <div className='grid-item'></div>
            <div className='gird-item'>
                <button id="connectWalletBtn" className="ButtonOne" onClick={connectWallet}>1. Connect wallet</button>
            </div>
            <div className='grid-item border full-withradius'>Follow The Steps : ➡️</div>
            <div className='gird-item'>
                <button id="siweBtn" className="ButtonOne" onClick={() => { signInWithEthereum(); setSignUp(); }}>2. Sign-in with Ethereum</button>
            </div>
            <div className='grid-item'></div>
            <div className='gird-item'>
                <button id="infoBtn" className="ButtonOne" onClick={getInformation}>3. Get session information</button>
            </div>
        </div>

        <div ref={welcomeElm} className="hidden" id="welcome"></div>
        <div ref={profileElm} className="hidden" id="profile">
            <h3>ENS Metadata:</h3>
            <div ref={ensLoaderElm} id="ensLoader"></div>
            <div ref={ensContainerElm} id="ensContainer" className="hidden">
                <table ref={ensTableElm} id="ensTable"></table>
            </div>
        </div>
        <div ref={noProfileElm} className="hidden" id="noProfile">No ENS Profile Found.</div>
        <div ref={nftElm} className="hidden" id="nft">
            <h3>NFT Ownership</h3>
            <div ref={nftLoaderElm} id="nftLoader"></div>
            <div ref={nftContainerElm} id="nftContainer" className="hidden">
                <table ref={nftTableElm} id="nftTable"></table>
            </div>
        </div>
    </div>);


}

export default Login


