module certificate::certificate_nft {
    use sui::event;
    use std::string;

    /// 認定証明書を表すNFTオブジェクト
    public struct CertificateNFT has key, store {
        id: object::UID,                          
        name: string::String,             
        description: string::String,      
        walrus_cid: string::String,
        recipient: address,
        approved: bool,
    }

    /// 証明書NFT発行イベント
    public struct CertificateIssued has copy, drop {
        object_id: object::ID,        
        issuer: address,      
        name: string::String, 
        walrus_cid: string::String,
    }

    /// 証明書NFTを発行する関数
    #[allow(lint(self_transfer))]
    public fun mint_certificate(
        name: vector<u8>,          
        description: vector<u8>,   
        walrus_cid: vector<u8>,
        recipient: address,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let nft = CertificateNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            description: string::utf8(description),
            walrus_cid: string::utf8(walrus_cid),
            recipient: recipient,
            approved: false,
        };

        event::emit(CertificateIssued {
            object_id: object::id(&nft),
            issuer: sender,
            name: nft.name,
            walrus_cid: nft.walrus_cid,
        });

        transfer::public_transfer(nft, sender);
    }

    const ENotRecipient: u64 = 0;

    /// 承認関数
    public fun approve_certificate(nft: &mut CertificateNFT, ctx: &mut tx_context::TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == nft.recipient, ENotRecipient);
        nft.approved = true;
    }
}
