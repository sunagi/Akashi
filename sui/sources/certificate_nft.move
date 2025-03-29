module certificate::certificate_nft {
    use sui::event;
    use std::string;

    /// 認定証明書を表すNFTオブジェクト（description を削除済み）
    public struct CertificateNFT has key, store {
        id: object::UID,
        name: string::String,
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
        walrus_cid: vector<u8>,
        recipient: address,
        ctx: &mut tx_context::TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let nft = CertificateNFT {
            id: object::new(ctx),
            name: string::utf8(name),
            walrus_cid: string::utf8(walrus_cid),
            recipient,
            approved: false,
        };

        event::emit(CertificateIssued {
            object_id: object::id(&nft),
            issuer: sender,
            name: nft.name,
            walrus_cid: nft.walrus_cid,
        });

        // 受領者に直接送信
        transfer::public_transfer(nft, recipient);
    }

    /// 証明書承認関数（recipient の所有者だけが呼び出せる）
    entry fun approve_certificate(nft: &mut CertificateNFT, _ctx: &tx_context::TxContext) {
        nft.approved = true;
    }
}