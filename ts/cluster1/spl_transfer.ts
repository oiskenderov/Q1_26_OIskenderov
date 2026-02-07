import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("FZGJTAyRkMx5oHEJpmr2QvuSE5JX2wbzaAVEh9FqtTSX");

// Recipient address
const to = new PublicKey("9yq8BgSG7XahLBKivhTiHKbrhXfHTA8Yk4xixgyg8yyd");

(async () => {
    try {
        // 1. Get or create the Associated Token Account (ATA) for the sender (YOU)
        // This is where your NFT currently "lives"
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const fromAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,      // Payer for the transaction
            mint,         // The NFT's mint address
            keypair.publicKey // Owner of the source account
        );
        console.log(`Your ATA Address: ${fromAta.address.toBase58()}`);
        
        // 2. Get or create the ATA for the recipient (PARTNER)
        // If they don't have an account for this NFT yet, this will create it
        // Get the token account of the toWallet address, and if it does not exist, create it
        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,      // Payer for the account creation
            mint,         // The NFT's mint address
            to            // Recipient's public wallet address
        );
        console.log(`Recipient ATA Address: ${toAta.address.toBase58()}`);        
        
        // 3. Transfer the NFT
        // For NFTs, the amount is always 1 and decimals are 0
        console.log("Transferring NFT...");
        const signature = await transfer(
            connection,
            keypair,            // Payer
            fromAta.address,    // From ATA
            toAta.address,      // To ATA
            keypair.publicKey,  // Authority (Owner of the 'from' account)
            1                   // Amount: 1 for NFT
        );

        console.log(`Success! Transaction: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
        } catch(e) {
        console.error(`Oops, something went wrong: ${e}`);
    }
})();