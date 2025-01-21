import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount, publicKey } from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { airdropIfRequired, getExplorerLink, getKeypairFromFile } from "@solana-developers/helpers";
import { Connection, LAMPORTS_PER_SOL, clusterApiUrl } from "@solana/web3.js";

//连接devnet
const connection = new Connection(clusterApiUrl("devnet"));

//获取钱包
const user = await getKeypairFromFile();

//空投
await airdropIfRequired(connection,user.publicKey,1*LAMPORTS_PER_SOL,0.5*LAMPORTS_PER_SOL);

console.log("Loaded user:",user.publicKey.toBase58());

//创建NFT
const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

//创建umiUser
const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("{collectionAddress}");

console.log(`Creating NFT...`)

const mint = generateSigner(umi);

const transaction = await createNft(umi, {
    mint,
    name:"MY NFT",
    uri:"https://raw.githubusercontent.com/aidyfeng/new-nft/refs/heads/main/sample-nft-offchain-data.json",
    sellerFeeBasisPoints:percentAmount(0),
    collection:{
        key:collectionAddress,
        verified:false
    }
});

await transaction.sendAndConfirm(umi);

const createdNFT = await fetchDigitalAsset(umi, mint.publicKey);

console.log(`Created NFT! Address is ${getExplorerLink("address",createdNFT.mint.publicKey,"devnet")}`);