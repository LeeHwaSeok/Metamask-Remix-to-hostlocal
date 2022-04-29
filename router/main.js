
const Tx = require('ethereumjs-tx').Transaction
const Web3 = require('web3')
const abi = require('../public/js/contractabi.json')
const web3 = new Web3('https://ropsten.infura.io/v3/3c52917848e945229c0d33d632b10490')  //1번 소토랩 html_start -> index.js 에서 web3 긁기

const account = '0x471B99161e7EFA9a8AE78a385e0d73B1Ea6fB799'                              //2번 메타마스크 계좌 주소

// const account = web3.eth.accounts[0];
// console('account : ' + account);
// web3.etth.getBalance(account, (error, balance) => {
//    if (!error)
//         console.log('getBalance:' + balance);
// }

const privateKey = Buffer.from('4a071172f7463ee26a92af22c63dc2d89c3e41c7aa2b31bfc2beb744274b8218', 'hex') //3번 메타마스크 프라이벳키 ->  개정새부정보 -> 비공개키 내보내기
const contractAddress = '0xa82DfD1C9999BBF4a6dD250CBBAF00b68a7c615f'                         //4번 Remix IDE -> CA주소 
const contract = new web3.eth.Contract(abi, contractAddress)                                 //5번 Remix IDE -> public -> js -> contractabi.json에 ABI 붙여 넣기
                                                                                            //6번 package.json 버전 1.3.2
const bodyParser = require('body-parser')

module.exports = function (app) {
    app.use(bodyParser.json());       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
        extended: true
    }));

    app.get('/', function (req, res) {
        res.render('index.html')
    });

    app.post('/getNumber', function (req, res) {
        //res.render('about.html');
        console.log('getNumber...');
        contract.methods.getNumOfProducts().call()
            .then(length => {
                console.log(" Value before increment: " + length)
                var response = {
                    'result': 'true',
                    'getNumOfProducts': result,
                }

                console.log('response : ' + response);

                res.status(200).json(response);
            });  // end of .then
    });  // end of app.post

    app.get('/listall', function (req, res) {
        //res.render('about.html');
        console.log('listall...');
        // const getNumber = req.body.getNumber;
        contract.methods.getAllproducts().call()
            .then(productes => {
                console.log(" Value productes: " + productes)
                var response = {
                    'result': 'true',
                    'getLists': productes
                }

                console.log('response : ' + response);
                res.status(200).json(response);
            });  // end of .then
    });  // end of app.post

    app.get('/list', function (req, res) {
        //res.render('about.html');
        console.log('list...');
        // const getNumber = req.body.getNumber;
        contract.methods.getNumOfProducts().call()
            .then(length => {
                console.log(" Value before increment: " + length)
                // for (var i = 0; i < length; i++) {
                contract.methods.getProductStruct(length - 1).call()
                    .then(value => {
                        let list = value[0] + ", " + value[1] + ", " + value[2] + ", " + value[3]
                        console.log(" value: ", value[0] + ", " + value[1] + ", " + value[2] + ", " + value[3]);
                        var response = {
                            'result': 'true',
                            'getLists': list
                        }

                        console.log('response : ' + response);
                        res.status(200).json(response);
                    })  // end of .then (value)
            });  // end of .then
        // }
    });  // end of app.post

    app.post('/submit', function (req, res) {
        console.log('submit : ', req.body);
        const number = req.body.pronumber;
        const name = req.body.proname;
        const location = req.body.proloc;
        console.log('number : ' + number + ", " + name + ", " + location);

        const contractFunction = contract.methods.addProStru(number, name, location)
        const functionAbi = contractFunction.encodeABI()

        web3.eth.getTransactionCount(account).then(_nonce => {
            const txParams = {
                nonce: web3.utils.toHex(_nonce),
                gasPrice: web3.utils.toHex(web3.utils.toWei('4', 'gwei')),
                gasLimit: web3.utils.toHex(210000),
                from: account,
                to: contractAddress,
                data: functionAbi
            };

            const tx = new Tx(txParams, { 'chain': 'ropsten' })
            tx.sign(privateKey)
            serializedTx = tx.serialize()

            contract.methods.getNumOfProducts().call()
                .then(result => console.log(" Value before increment: " + result))

            web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                .on('receipt', receipt => {
                    console.log("receipt :", receipt);
                    contract.methods.getNumOfProducts().call()
                        .then(length => {
                            console.log(" getNumOfProducts: " + length)
                        })
                    var response = {
                        'result': 'true',
                        'blockHash': receipt.blockHash,
                        'transactionHash': receipt.transactionHash,
                    }

                    res.status(200).json(response);
                    console.log('response : ' + response);
                })   // end of on('receipt')
        })  // web3.eth.getTransactionCount
    });  //end of app.post

}  // end of module
