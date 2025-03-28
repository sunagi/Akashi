const { WalrusClient } = require('walrus-client'); // Walrusクライアントをインポート
const { SuiWallet } = require('sui-wallet'); // Sui Walletをインポート

async function uploadFile(filePath) {
    const walrusClient = new WalrusClient(); // Walrusクライアントのインスタンスを作成
    try {
        const result = await walrusClient.upload(filePath); // ファイルをWalrusにアップロード
        console.log('ファイルが正常にアップロードされました:', result);
    } catch (error) {
        console.error('ファイルのアップロード中にエラーが発生しました:', error);
    }
}

async function connectWallet() {
    try {
        const wallet = await SuiWallet.connect(); // Sui Walletに接続
        console.log('ウォレットに接続されました:', wallet);
        return wallet;
    } catch (error) {
        console.error('ウォレットの接続中にエラーが発生しました:', error);
    }
}

// Connect Walletボタンのクリックイベントに接続処理を追加
document.getElementById('connectWalletButton').addEventListener('click', async () => {
    const wallet = await connectWallet(); // ウォレット接続を試みる
    if (wallet) {
        // ウォレット接続後の処理をここに追加
    }
});

// 使用例
uploadFile('/path/to/your/file.txt'); // アップロードするファイルのパスを指定 