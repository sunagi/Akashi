# Akashi

Akashi is an application that allows users to upload certificates and mint them as NFTs. This project utilizes blockchain technology to simplify the issuance and management of certificates.

## Features

- Upload certificate files (supports PDF, PNG, JPEG formats)
- Input certificate title and recipient address
- Mint certificates as NFTs
- Integrate with user wallets

## Requirements

- Node.js (version 14 or higher)
- npm (Node Package Manager)

## Installation Steps

1. Clone the repository.

   ```bash
   git clone https://github.com/sunagi/Akashi.git
   cd akashi
   ```

2. Install the dependencies.

   ```bash
   npm install
   ```

3. Set up environment variables. Create a `.env` file and add the necessary settings.

   ```plaintext
   REACT_APP_WALLET_KIT_API_KEY=your_api_key
   ```

4. Start the application.

   ```bash
   npm start
   ```

## Usage

1. Open the application and either drag and drop a certificate or click to select a file.
2. Input the certificate title and recipient address.
3. Click the "Send Certificate" button to mint the certificate as an NFT.

demo
https://akashi-theta.vercel.app/

## Code Explanation

- `CertificateUpload.tsx`: Component that manages the upload of certificates and the minting of NFTs.
- `useWalletKit`: Hook for integrating with the user's wallet.
- `TransactionBlock`: Manages transactions on the blockchain.

## Contribution

Contributions are welcome! Please report bugs, suggest features, or submit pull requests.

## Contract
https://suiscan.xyz/testnet/object/0x5f0eb7ec940daaa1096dc1cb18b507c8e01d5bfe9951f57a04178e8fce8b1d01/tx-blocks