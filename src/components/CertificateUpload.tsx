import React, { useState } from 'react';
import { File } from 'lucide-react';
import { useWalletKit } from '@mysten/wallet-kit';
import { TransactionBlock } from '@mysten/sui.js/transactions';

const CertificateUpload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [certificateTitle, setCertificateTitle] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
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

  const mintCertificateNFT = async (title: string, walrusCid: string, recipient: string) => {
    if (!currentAccount) throw new Error('Wallet not connected');
    const PACKAGE_ID = '0x5f0eb7ec940daaa1096dc1cb18b507c8e01d5bfe9951f57a04178e8fce8b1d01';

    const tx = new TransactionBlock();
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate_nft::mint_certificate`,
      arguments: [
        tx.pure(title),
        tx.pure(walrusCid),
        tx.pure(recipient)
      ]
    });

    const result = await signAndExecuteTransactionBlock({ transactionBlock: tx });
    return result;
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    try {
      const walrusCid = await uploadToWalrus(selectedFile);

      await mintCertificateNFT(
        certificateTitle,
        walrusCid,
        recipientAddress
      );

      alert('Certificate successfully minted as NFT!');
      setSelectedFile(null);
      setCertificateTitle('');
      setRecipientAddress('');
    } catch (error) {
      console.error('Error details:', error);
      alert(`An error occurred during upload or minting: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (certificateTitle.trim() === '') {
        setCertificateTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  return (
    <>
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
          {selectedFile && (
            <p className="text-sm text-white/60 mt-2">Selected file: {selectedFile.name}</p>
          )}
        </div>
        <input
          type="file"
          id="fileUpload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleChange}
        />
      </div>
      {selectedFile && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Certificate Title"
            className="w-full p-2 rounded bg-white/10 text-white placeholder-white/50"
            value={certificateTitle}
            onChange={(e) => setCertificateTitle(e.target.value)}
          />
        </div>
      )}
      {selectedFile && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Recipient Address"
            className="w-full p-2 rounded bg-white/10 text-white placeholder-white/50"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
          />
        </div>
      )}
      <div className="mt-4 text-center">
        <button
          className={`py-2 px-4 rounded ${
            selectedFile &&
            certificateTitle.trim() !== '' &&
            recipientAddress.trim() !== ''
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
          onClick={handleFileUpload}
          disabled={
            !selectedFile ||
            certificateTitle.trim() === '' ||
            recipientAddress.trim() === ''
          }
        >
          Send Certificate
        </button>
      </div>
    </>
  );
};

export default CertificateUpload;