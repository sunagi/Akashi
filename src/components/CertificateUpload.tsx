import React, { useState } from 'react';
import { File } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const CertificateUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const { currentAccount, signAndExecuteTransactionBlock } = useWalletKit();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const uploadToWalrus = async (file: File): Promise<string> => {
    const publisherUrl = 'https://publisher.walrus-testnet.walrus.space';
    const aggregatorUrl = 'https://aggregator.walrus-testnet.walrus.space';
    const epochs = 100;
    const address = currentAccount?.address;

    if (!address) throw new Error('Wallet not connected');

    const response = await fetch(
      `${publisherUrl}/v1/blobs?epochs=${epochs}&send_object_to=${address}`,
      {
        method: 'PUT',
        body: file
      }
    );

    if (!response.ok) {
      throw new Error(`Walrus upload failed: ${response.statusText}`);
    }

    const info = await response.json();
    const blobId = info.newlyCreated?.blobObject?.blobId || info.alreadyCertified?.blobId;
    if (!blobId) throw new Error('Walrus blobId not found');

    return `${aggregatorUrl}/v1/blobs/${blobId}`;
  };

  const mintCertificateNFT = async (file: File, walrusCid: string) => {
    if (!currentAccount) throw new Error('Wallet not connected');
    const PACKAGE_ID = '0xd0f1a15a1363966b7c19b659171c6f892fac44d6cc63dca67c05f9244362a1e3';

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate_nft::mint_certificate`,
      arguments: [
        tx.pure(file.name),
        tx.pure('Uploaded via Akashi DApp'),
        tx.pure(walrusCid)
      ]
    });

    const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
    return result;
  };

  const handleFileUpload = async (file: File) => {
    try {
      const walrusCid = await uploadToWalrus(file);
      await mintCertificateNFT(file, walrusCid);
      alert('Certificate successfully minted as NFT!');
    } catch (error) {
      console.error(error);
      alert('An error occurred during upload or minting.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragActive ? 'border-emerald-400 bg-emerald-400/10' : 'border-white/20 hover:border-emerald-400/50'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileUpload')?.click()}
    >
      <div className="flex flex-col items-center gap-4">
        <File className="w-12 h-12 text-emerald-400" />
        <div className="text-white">
          <p className="text-lg font-medium">Drop your certificate here</p>
          <p className="text-sm text-white/60">or click to browse</p>
        </div>
        <p className="text-xs text-white/40">Supports PDF and image files</p>
      </div>
      <input
        type="file"
        id="fileUpload"
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleChange}
      />
    </div>
  );
};

export default CertificateUpload;