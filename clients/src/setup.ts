import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    Signer,
} from "@solana/web3.js";

import { createAssociatedTokenAccount, createMint, mintTo } from "@solana/spl-token";
import {
    getKeypair,
    getPublicKey,
    getTokenBalance,
    writePublicKey,
} from "./utils";

const createTokenMint = (
    connection: Connection,
    { publicKey, secretKey }: Signer
) => {
    return createMint(
        connection,
        {
            publicKey,
            secretKey,
        },
        publicKey,
        null,
        0
    );
};

const setupMint = async (
    name: string,
    connection: Connection,
    alicePublicKey: PublicKey,
    bobPublicKey: PublicKey,
    clientKeypair: Signer
): Promise<[PublicKey, PublicKey, PublicKey]> => {
    console.log(`Creating Mint ${name}...`);
    const mintPublicKey = await createTokenMint(connection, clientKeypair);
    writePublicKey(mintPublicKey, `mint_${name.toLowerCase()}`);

    console.log(`Creating Alice TokenAccount for ${name}...`);
    const aliceTokenAccount = await createAssociatedTokenAccount(
        connection,
        clientKeypair,
        mintPublicKey,
        alicePublicKey
    )
    writePublicKey(aliceTokenAccount, `alice_${name.toLowerCase()}`);

    console.log(`Creating Bob TokenAccount for ${name}...`);
    const bobTokenAccount = await createAssociatedTokenAccount(
        connection,
        clientKeypair,
        mintPublicKey,
        bobPublicKey
    )
    writePublicKey(bobTokenAccount, `bob_${name.toLowerCase()}`);

    return [mintPublicKey, aliceTokenAccount, bobTokenAccount];
};

const setup = async () => {
    const alicePublicKey = getPublicKey("alice");
    const bobPublicKey = getPublicKey("bob");
    const clientKeypair = getKeypair("id");

    const connection = new Connection("http://localhost:8899", "confirmed");
    console.log("Requesting SOL for Alice...");
    // some networks like the local network provide an airdrop function (mainnet of course does not)
    await connection.requestAirdrop(alicePublicKey, LAMPORTS_PER_SOL * 10);
    console.log("Requesting SOL for Bob...");
    await connection.requestAirdrop(bobPublicKey, LAMPORTS_PER_SOL * 10);
    console.log("Requesting SOL for Client...");
    await connection.requestAirdrop(clientKeypair.publicKey, LAMPORTS_PER_SOL * 10);

    const [mintXPubKey, aliceTokenAccountForX, bobTokenAccountForX] = await setupMint(
        "X",
        connection,
        alicePublicKey,
        bobPublicKey,
        clientKeypair
    );
    console.log("Sending 50X to Alice's X TokenAccount...");
    await mintTo(
        connection, 
        clientKeypair, 
        mintXPubKey, 
        aliceTokenAccountForX, 
        clientKeypair.publicKey, 
        50
        );

    const [mintYPubKey, aliceTokenAccountForY, bobTokenAccountForY] = await setupMint(
        "Y",
        connection,
        alicePublicKey,
        bobPublicKey,
        clientKeypair
    );
    console.log("Sending 50Y to Bob's Y TokenAccount...");
    await mintTo(
        connection, 
        clientKeypair, 
        mintYPubKey, 
        bobTokenAccountForY, 
        clientKeypair.publicKey, 
        50
        );

    console.log("✨Setup complete✨\n");
    console.table([
        {
            "Alice Token Account X": await getTokenBalance(
                aliceTokenAccountForX,
                connection
            ),
            "Alice Token Account Y": await getTokenBalance(
                aliceTokenAccountForY,
                connection
            ),
            "Bob Token Account X": await getTokenBalance(
                bobTokenAccountForX,
                connection
            ),
            "Bob Token Account Y": await getTokenBalance(
                bobTokenAccountForY,
                connection
            ),
        },
    ]);
    console.log("");
};

setup();