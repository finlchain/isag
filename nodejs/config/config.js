//
const fs = require('fs');

//
const cryptoSsl = require("./../../../addon/crypto-ssl");

//
const NETCONF_JSON = JSON.parse(fs.readFileSync("./../../conf/netconf.json"));

//
module.exports.KEY_PATH = {
    ED_PRIKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PRIKEY, 
    ED_PUBKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PUBKEY, 
    NN_PRIKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PRIKEY, 
    NN_PUBKEY_NAME : NETCONF_JSON.KEY.NAME.ED_PUBKEY, 
    KEY_ROOT : NETCONF_JSON.DEF_PATH.KEY_ROOT + '/', 
    MY_KEY : NETCONF_JSON.DEF_PATH.KEY_ME + '/', 
    PW_SEED: NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SEED, 
    PW_MARIA : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.MARIA, 
    PW_SHARD : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.SHARD, 
    PW_REPL_NN : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_NN, 
    PW_REPL_IS : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_IS, 
    PW_REPL_ISAG : NETCONF_JSON.DEF_PATH.PW_DB_ME + '/' + NETCONF_JSON.DB.PW.NAME.REPL_ISAG, 
    IS_PUBKEY: NETCONF_JSON.DEF_PATH.KEY_REMOTE_IS + '/' + NETCONF_JSON.KEY.NAME.ED_PUBKEY, 
}

// 
module.exports.CFG_PATH = {
    CONTRACT_ACTIONS : NETCONF_JSON.DEF_INFO.CONTRACT_ACTIONS, 
    NODE_CFG : NETCONF_JSON.DEF_INFO.NODE_CFG, 
    MARIA : {
        DB_HOST : NETCONF_JSON.DB.MARIA.HOST, 
        DB_PORT : NETCONF_JSON.DB.MARIA.PORT, 
        DB_USER : NETCONF_JSON.DB.MARIA.USER, 
        PW_MARIA : cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_MARIA),
        REPL_USERS : [
            NETCONF_JSON.DB.REPL.USER_NN, 
            NETCONF_JSON.DB.REPL.USER_IS, 
            NETCONF_JSON.DB.REPL.USER_ISAG, 
        ], 
        REPL_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_NN), 
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_IS), 
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_REPL_ISAG), 
        ], 
        SHARD_USERS : [
            NETCONF_JSON.DB.SHARD.USER_IS, 
        ], 
        SHARD_USERS_PW : [
            cryptoSsl.aesDecPw(this.KEY_PATH.PW_SEED, this.KEY_PATH.PW_SHARD), 
        ]
    },
}

//
module.exports.SOCKET_INFO = {
    BIND_ISAG_SEVER_PORT : NETCONF_JSON.IS.SOCKET.ISAG.SERVER.PORT, 
    BIND_ISAG_SEVER_HOST : NETCONF_JSON.IS.SOCKET.ISAG.SERVER.HOST, 
    BIND_ISAG_CLIENT_PORT : NETCONF_JSON.IS.SOCKET.ISAG.CLIENT.PORT
}

module.exports.MARIA_CONFIG = {
    host: this.CFG_PATH.MARIA.DB_HOST,
    port: this.CFG_PATH.MARIA.DB_PORT,
    user: this.CFG_PATH.MARIA.DB_USER,
    password: this.CFG_PATH.MARIA.PW_MARIA,
    // database: ...
    supportBigNumbers: true,
    bigNumberStrings: true,
    connectionLimit : 10
}

// Version info
module.exports.paddy = (num, padLen, padChar) => {
    var pad_char = typeof padChar !== 'undefined' ? padChar : '0';
    var pad = new Array(1 + padLen).join(pad_char);

    return (pad + num).slice(-pad.length);
}

const getVerInfo = () => {
    //
    let mainVerInfo = '0';
    let subVerInfo = '0';

    //
    let lineArr = fs.readFileSync(this.CFG_PATH.NODE_CFG).toString().split('\n');

    for (idx in lineArr)
    {
        if (lineArr[idx].includes('VER_INFO_MAIN'))
        {
            mainVerInfo = lineArr[idx].split(' ')[2];
        }
        else if (lineArr[idx].includes('VER_INFO_SUB'))
        {
            subVerInfo = lineArr[idx].split(' ')[2];
        }
    }

    let verInfo = mainVerInfo + '.' + this.paddy(subVerInfo, 4);

    return verInfo;
}

//
module.exports.VERSION_INFO = getVerInfo();

module.exports.CMD_ENCODING = {
    encoding: 'utf8'
}

module.exports.DB_TEST_MODE = false;
module.exports.DB_TEST_MODE_DROP = false;
module.exports.DB_TEST_MODE_REPL = false;

// VM true? 1, false? 0
module.exports.IS_VM = 1;

module.exports.TEST_HW_INO = {
    CPU : "Test CPU",
    MEMSIZE : 8,
    MEMSPEED : 1200
}

// IP Control
module.exports.IP_ASSIGN = {
    CTRL : 1,
    DATA : 0,
    REPL : 0
};
