import { createNft, fetchDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { generateSigner, keypairIdentity, percentAmount } from "@metaplex-foundation/umi";
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

//创建collection
const collectionMint = generateSigner(umi);

//创建交易
const transaction = await createNft(umi,{
    mint:collectionMint,
    name:"My NFT Collection",
    symbol:"MNC",
    uri:"https://arweave.net/123456",
    sellerFeeBasisPoints:percentAmount(0),
    isCollection: true
});

//发送并确认交易
await transaction.sendAndConfirm(umi);

//获取数字资产
const createdCollectionNft = await fetchDigitalAsset(umi,collectionMint.publicKey);

console.log(`Created collection! Address is 
    ${getExplorerLink("address",createdCollectionNft.mint.publicKey,"devnet")}`);