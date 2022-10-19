const bodyParser = require('body-parser');
const nacl = require('tweetnacl');

const opcodeSend = {
    PONG: 1,
    CHANNEL_MESSAGE_WITH_SOURCE: 4,
    DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
    DEFERRED_UPDATE_MESSAGE: 6,
    UPDATE_MESSAGE: 7,
    APPLICATION_COMMAND_AUTOCOMPLETE_RESULT: 8,
    MODAL: 9,
};

const opcodeReceive = {
    PING: 1,
    APPLICATION_COMMAND: 2,
    MESSAGE_COMPONENT: 3,
    APPLICATION_COMMAND_AUTOCOMPLETE: 4,
    APPLICATION_MODAL_SUBMIT: 5,
};

function createDefaultOptions(options = {}) {
    if (!(options instanceof Object)) options = {}
    const default_ = {
        port: process.env.PORT || 3000,
        publicKey: null,
    }
    return Object.assign(default_, options)
}

module.exports = function (express, options = {}, callback) {
    options = createDefaultOptions(options);
    if (!options.publicKey) throw new Error('Public key is not defined');
    if (typeof callback !== 'function') throw new Error('Callback is not defined or is not a function');
    async function authCheck(req, res) {
        const PUBLIC_KEY = options.publicKey;
        const signature = req.headers['x-signature-ed25519'];
        const timestamp = req.headers['x-signature-timestamp'];
        const body = JSON.stringify(req.body);
        const isVerified = nacl.sign.detached.verify(
            Buffer.from(timestamp + body),
            Buffer.from(signature, 'hex'),
            Buffer.from(PUBLIC_KEY, 'hex'),
        );
        if (!isVerified) {
            res.status(401).send('Invalid request signature');
            return false;
        }
        else {
            return true;
        }
    }
    let express_;
    if (!express || typeof express !== 'function') {
        try {
            express_ = require('express');
        } catch (e) {
            throw new Error('Express is not installed. Please install it or pass it as a parameter.');
        }
        express = express_();
        express.listen(options.port);
    }
    express.use(bodyParser.json());
    express.use(
        bodyParser.urlencoded({
            extended: true,
        }),
    );
    express.post('/interaction', async (req, res) => {
        // Auth
        const resAuth = await authCheck(req, res);
        if (!resAuth) return;
        // Type
        const type = req.body.type;
        // Check ping pong
        if (opcodeReceive.PING == type) {
            res.status(200).send({
                type: opcodeSend.PONG,
            });
        }
        else {
            callback(req.body);
        }
    });
    return express;
}