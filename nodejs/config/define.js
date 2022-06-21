//
const config = require('./../config/config.js');

// Define

const ENABLED = true;
const DISABLED = false;

module.exports.ERR_CODE ={
    ERROR : -1,
    SUCCESS : 1
}

module.exports.PRE_CMD = {
    NODE_PS_CKH_CMD : `ps aux | awk '/node/' | awk '!/isa/' | awk '!/awk/' | awk '{print $2}'`
}

//HW Info
module.exports.HW_INFO = {
    //
    HYPERVISOR: "lscpu  | awk '{print $1}'",
    VIRTUALIZATION: "hostnamectl | awk '{print $1}'",
    MEM_SIZE: "sudo dmidecode -t 17 | grep Size | awk '{print $2}' | awk '!/No/'",
    MEM_SPEED: "sudo dmidecode -t 17 | grep 'Configured Clock Speed' | awk '{print $4}' | awk '!/Unknown/'",
    STORAGE_INFO: "sudo lsblk -P -o rm,rota,name,size,type | grep -E 'disk|raid'",
    CPU_MODEL: "sudo dmidecode -t 4 | grep 'Version:' | awk '{ print substr($0,index($0,$2)) }'",
    BOARD_SN: "sudo dmidecode -s system-serial-number",
    SYSTEM_UUID: "sudo dmidecode -s system-uuid",
    GET_ID: "hostname",
};

module.exports.HW_INFO_KIND = {
    VIRTUAL_CHK_1: 'Hypervisor',
    VIRTUAL_CHK_2: 'Virtualization:',
    LOCATE_ROTA: 3,
    LOCATE_ROTA_KIND : {
        HDD_ROTA: '1',
        SDD_ROTA: '0'
    },
    LOCATE_NVME: 5,
    LOCATE_NVME_KIND : {
        NVME_ROTA: 'nvme'
    },
    LOCATE_SIZE: 7,
    LOCATE_SIZE_KIND : {
        GIGA: 'G',
        TERA: 'T',
        UNIT_CHANGE: 1024
    },
    LOCATE_TYPE: 9,
    LOCATE_TYPE_KIND : {
        RAID_ROTA: 'raid'
    },
    RAID_NONE: 'none'
}

//APP Info
module.exports.APP_INFO = {
    //
    PS_NODE: "ps aux | awk '/node/' | awk '!/isa/' | awk '!/awk/' | awk '{print $2}'", 
    KILL_NODE: "kill -9 $(ps aux | awk '/node/' | awk '!/isa/' | awk '!/awk/' | awk '{print $2}')",
    
    APP_STATUS_1: "ps -ef |grep node | awk '{print $8}'",
    APP_STATUS_2: "ps -ef |grep node | awk '{print $9}'"
};

module.exports.APP_NAME = {
    CPP: './bin/node',
    NODE: 'main.js'
}

module.exports.NODE_ROLE = {
    STR : {
        NN : 'NN',
        DN : 'DN',
        DBN : 'DBN',
        SCA : 'SCA',
        ISAG: 'ISAg',
        RN : 'RN',
        BN : 'BN'
    },
    NUM : {
        NN: 0,
        // DN: 1,
        DBN: 2,
        ISAG: 4
    },
}

module.exports.SOCKET_ARG = {
    SEPARATOR: "\r"
}

module.exports.CRYPTO_ARG = {
    //
    HASH: 'sha256',
    // digest
    HEX: 'hex',
    BASE64: 'base64',
    //
    EDDSA: 'ed25519'
}

module.exports.CMD = {
    encoding: 'utf8'
}

module.exports.CMD_CTRL_NOTI = {
    // Request
    req_reset:              'leave all', // SCA NNA
    req_rerun:              're run', // SCA NNA
    req_rr_update:          'rr update', // NNA
    req_net_init:           're init', // NNA
    req_node_start:         'node start', // ?
    req_node_kill:          'node kill', // ISA itself
    req_rr_next:            'rr next', // NNA
    req_bg_start:           'rr start', // NNA
    req_bg_stop:            'rr stop', // NNA
    req_last_bn:            'last bn', // ISA itself // SCA
    req_net_save:           'net save', // ISA itself
    req_contract_txs:       'contract txs',
    req_bg_restart:         'rr restart', // NNA
    req_db_truncate:        'db truncate', // SCA NNA
    req_db_repl_set:        'repl set',
    req_db_repl_get:        'repl get',
    req_db_repl_stop:       'repl stop',
    req_db_repl_reset:      'repl reset',
    req_db_repl_start:      'repl start',
    req_db_repl_dataReq:    'repl dataReq',
    req_db_repl_dataRsp:    'repl dataRsp',
    req_contract_test:      'contract test',
    req_contract_chk:       'contract chk',
    req_node_info_exist:    'node info exist',
    // Response
    rsp_prr_error:          'prr error',
    req_prr_passed:         'prr passed',
    rsp_prr: 'prr',
    rsp_prr_cmd : {
        err : 'error',
        passed : 'passed'
    },
}

module.exports.START_MSG = "=================================================="
    + "\n= FINL Block Chain                               ="
    + "\n= [ ISAg Ver : " + config.VERSION_INFO + "]                              ="
    + "\n==================================================";

module.exports.REGEX = {
    NEW_LINE_REGEX: /\n+/, 
    WHITE_SPACE_REGEX: /\s/, 
    IP_ADDR_REGEX: /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/, 
    HASH_REGEX: /^[a-z0-9+]{5,65}$/, 
    HEX_STR_REGEX: /^[a-fA-F0-9]+$/, 
    // ID_REGEX: /^(?=.*[A-Z])(?!.*[a-z])(?!.*[\s()|!@#\$%\^&\*])(?=.{4,})/, 
    ID_REGEX: /^([A-Z0-9_]){4,16}$/,
    PW_STRONG_REGEX : /^([a-zA-Z0-9!@$%^~*+=_-]){10,}$/, 
    PW_STRONG_COND_REGEX : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[])(?=.*[!@$%^~*+=_-]).{10,}$/, 
    // PW_STRONG_COND_REGEX : /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?!.*[~#&()<>?:{}])(?=.*[!@$%^~*+=_-]).{10,}$/, 
    PW_MEDIUM_REGEX : /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/, 
    FINL_ADDR_REGEX: /^(FINL){1}[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{1, }$/, 
    PURE_ADDR_REGEX: /^(PURE){1}[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{1, }$/
}

module.exports.COMMON_DEFINE = {
    PADDING_DELIMITER : {
        FRONT : 0,
        BACK : 1
    },
    ENABLED : ENABLED,
    DISABLED : DISABLED
}

//
module.exports.DB_DEFINE = {
    HEX_DB_KEY_LEN : {
        KEY_NUM_LEN : 12,
        KEY_INDEX_LEN : 4,
        DB_KEY_LEN : 16
    },
    REPL_QUERY_INDEX : {
        DROP_USER_INDEX : 0,
        CREATE_USER_INDEX : 1,
        GRANT_REPL_INDEX : 2
    },
    SHARD_USERS_QUERY_INDEX : {
        DROP_USER_INDEX : 0,
        CREATE_USER_INDEX : 1,
        GRANT_ALL_INDEX : 2
    },
}

module.exports.P2P_DEFINE = {
    P2P_SUBNET_ID_IS : '0001',
    P2P_ROOT_SPLIT_INDEX : {
        START : 10,
        END : 14
    },
    P2P_TOPIC_NAME_SPLIT_INDEX : {
        START : 2,
        END : 14
    }
}