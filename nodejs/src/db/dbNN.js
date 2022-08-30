const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const logger = require('./../utils/winlog.js');
const debug = require("./../utils/debug.js");

//
const procedureQuerys = {
    scQuerys: [
        "DROP PROCEDURE IF EXISTS SET_DB_KEY_INDEX",
        "CREATE PROCEDURE SET_DB_KEY_INDEX (IN _DBKeyString VARCHAR(20)) "
        + "BEGIN " 
        + "DECLARE _bigintDBkey BIGINT UNSIGNED; "
        + "DECLARE _stmt VARCHAR(1024); "
        + "SET _bigintDBkey = (SELECT CAST(_DBKeyString AS UNSIGNED INT)); "
        + "SET @SQL := CONCAT('ALTER TABLE sc_contents AUTO_INCREMENT = ', _bigintDBkey); " 
        + "PREPARE _stmt FROM @SQL; "
        + "EXECUTE _stmt; "
        + "DEALLOCATE PREPARE _stmt; "
        + "END"
    ]
}

const createDbNames = {
    "sc" : "sc",
    "block" : "block",
    "account" : "account",
}

const createTableNames = {
    scQuerys : [
        "sc_contents",
        "sc_delayed_txs",
    ],
    blockQuerys : [
        "blk_txs",
    ],
    blockShardQuerys : [
        "blk_contents",
    ],
    accountQuerys : [
        "account_tokens",
        "account_users",
        "account_ledgers",
        "account_balance",
        "account_sc",
    ]
}
module.exports.createTableNames = createTableNames;

const createTableFields = {
    scQuerys : [
        // sc_contents
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL,"
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        // + "`prv_db_key` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        // + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`confirmed` tinyint(3) NOT NULL DEFAULT 0,"
        + "`from_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`to_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`c_action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`dst_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`amount` text NOT NULL,"
        + "`signed_pubkey` text NOT NULL COMMENT 'Signed Public Key', "
        + "`err_code` smallint(5) NOT NULL DEFAULT 0,"
        + "`contract` json DEFAULT NULL,"
        + "KEY `action` (`action`, `create_tm`) USING BTREE, "
        + "KEY `c_action` (`action`, `c_action`) USING BTREE, "
        + "KEY `to_account` (`to_account`) USING BTREE, "
        + "KEY `from_account` (`from_account`) USING BTREE, "
        + "KEY `dst_account` (`dst_account`) USING BTREE, "
        + "KEY `db_key` (`db_key`, `confirmed`) USING BTREE, "
        + "KEY `create_tm` (`create_tm`) USING BTREE, "
        + "KEY `subnet_id` (`subnet_id`) USING BTREE, "
        + "UNIQUE KEY `uk_db_key` (`db_key`, `subnet_id`), "
        + "PRIMARY KEY (`db_key`, `confirmed`, `create_tm`, `to_account`, `from_account`, `subnet_id`) USING BTREE",

        // sc_delayed_txs
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL,"
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        + "`executed` tinyint(1) NOT NULL DEFAULT 0,"
        + "`from_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`to_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`c_action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`dst_account` bigint(20) unsigned DEFAULT 0 NOT NULL,"
        + "`amount` text NOT NULL,"
        + "`signed_pubkey` text NOT NULL COMMENT 'Signed Public Key', "
        + "`err_code` smallint(5) NOT NULL DEFAULT 0,"
        + "`contract` json DEFAULT NULL,"
        + "KEY `executed1` (`executed`, `action`, `from_account`, `to_account`) USING BTREE, "
        + "KEY `executed2` (`executed`, `create_tm`) USING BTREE, "
        + "KEY `create_tm` (`create_tm`) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        + "PRIMARY KEY (`idx`, `executed`, `create_tm`, `action`, `from_account`, `to_account`, `subnet_id`) USING BTREE",
    ],
    blockQuerys : [
        // blk_txs
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', "
        + "`sc_hash` text NOT NULL COMMENT 'Transaction Hash', "
        + "KEY `sc_hash` (`sc_hash`(64)) USING BTREE, "
        + "UNIQUE KEY `uk_db_key` (`db_key`, `subnet_id`), "
        + "PRIMARY KEY (`db_key`, `blk_num`, `sc_hash`(64), `subnet_id`) USING BTREE",
    ],
    blockShardQuerys : [
        // blk_contents
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number',"
        + "`p2p_addr` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'BP P2PAddrss', "
        + "`bgt` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Genration Time', "
        + "`pbh` text NOT NULL COMMENT 'Previous Block Hash', "
        + "`tx_cnt` int(11) unsigned DEFAULT 0 NOT NULL COMMENT 'Number of transaction the block has', "
        + "`blk_hash` text NOT NULL COMMENT 'Block Hash', "
        + "`sig` text NOT NULL COMMENT 'Signature of BP',"
        + "`pubkey` text NOT NULL COMMENT 'Signed Public Key',"
        + "`bct`  bigint(20) unsigned, "
        + "KEY `blk_hash` (`blk_hash`(64)) USING BTREE, "
        + "KEY `bgt` (`bgt`) USING BTREE, "
        + "UNIQUE KEY `uk_blk_num` (`blk_num`, `subnet_id`), "
        + "PRIMARY KEY (`blk_num`, `tx_cnt`, `blk_hash`(64), `subnet_id`) USING BTREE",
    ],
    accountQuerys : [
        // account_tokens
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`revision` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Revision', "
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', "
        //+ "`confirmed` tinyint(3) DEFAULT 0,"
        + "`owner_pk` text NOT NULL COMMENT 'Owner Public Key', "
        + "`super_pk` text NOT NULL COMMENT 'Super Owner Public Key', "
        //+ "`signed_pubkey` text NOT NULL COMMENT 'Signed Public Key', "
        + "`account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Account Number', "
        + "`action` int(11) unsigned NOT NULL DEFAULT 0, "
        + "`name` text BINARY DEFAULT NULL, "
        + "`symbol` text BINARY DEFAULT NULL, "
        + "`total_supply` text DEFAULT 0 NOT NULL, "
        + "`market_supply` text DEFAULT 0 NOT NULL, "
        + "`decimal_point` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`lock_time_from` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Lock Time From', "
        + "`lock_time_to` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Lock Time To', "
        + "`lock_transfer` tinyint(3) DEFAULT 0 NOT NULL,"
        + "`black_list` json DEFAULT NULL, "
        + "`functions` longtext DEFAULT NULL, "
        + "KEY `revision` (`revision`) USING BTREE, "
        + "KEY `pubkey` (`owner_pk`(64), `super_pk`(64)) USING BTREE, "
        + "KEY `owner_pk` (`owner_pk`(64)) USING BTREE, "
        + "KEY `super_pk` (`super_pk`(64)) USING BTREE, "
        + "KEY `action` (`action`) USING BTREE, "
        + "KEY `account` (`action`, `account_num`) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        + "PRIMARY KEY (`db_key`, `blk_num`, `subnet_id`) USING BTREE",
        // + "PRIMARY KEY (`action`, `account_num`, `db_key`, `blk_num`, `owner_pk`(64), `super_pk`(64), `subnet_id`) USING BTREE",
        
        // account_users
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`revision` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Revision', "
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', "
        //+ "`confirmed` tinyint(3) DEFAULT 0,"
        + "`owner_pk` text NOT NULL COMMENT 'Owner Public Key', "
        + "`super_pk` text NOT NULL COMMENT 'Super Owner Public Key', "
        //+ "`signed_pubkey` text NOT NULL COMMENT 'Signed Public Key', "
        + "`account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Account Number', "
        + "`account_id` text BINARY DEFAULT NULL,"
        + "KEY `revision` (`revision`) USING BTREE, "
        + "KEY `pubkey` (`owner_pk`(64), `super_pk`(64)) USING BTREE, "
        + "KEY `owner_pk` (`owner_pk`(64)) USING BTREE, "
        + "KEY `super_pk` (`super_pk`(64)) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        // + "PRIMARY KEY (`account_num`, `db_key`, `blk_num`, `subnet_id`) USING BTREE",
        + "PRIMARY KEY (`db_key`, `account_num`, `blk_num`, `owner_pk`(64), `super_pk`(64), `subnet_id`) USING BTREE",

        // account_ledgers
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', "
        //+ "`confirmed` tinyint(3) DEFAULT 0,"
        //+ "`signed_pubkey` text NOT NULL COMMENT 'Signed Public Key', "
        + "`my_account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Sending Account Number', "
        //+ "`from_to` tinyint(3) DEFAULT NULL,"
        + "`account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Receved Account Number', "
        + "`action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`amount` text DEFAULT NULL, "
        + "`balance` text DEFAULT NULL, "
        + "KEY `balance1` (`my_account_num`, `action`, `create_tm`) USING BTREE, "
        + "KEY `balance2` (`action`, `my_account_num`, `create_tm`) USING BTREE, "
        + "KEY `subnet_id` (`subnet_id`) USING BTREE, "
        + "KEY `action_account` (`action`, `my_account_num`) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        + "PRIMARY KEY (`idx`, `db_key`, `my_account_num`, `action`, `blk_num`, `create_tm`, `subnet_id`) USING BTREE",

        // account_balance
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`cfmd_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Confirmed Time', "
        + "`cfmd_blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Confirmed Block Number', "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', " 
        + "`my_account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Sending Account Number', "
        + "`action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`balance` text DEFAULT NULL, "
        + "`balanceN` bigint(20) unsigned DEFAULT NULL, "
        + "KEY `balance1` (`my_account_num`, `action`) USING BTREE, "
        + "KEY `balance2` (`action`, `my_account_num`) USING BTREE, "
        + "KEY `subnet_id` (`subnet_id`) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        + "PRIMARY KEY (`idx`, `my_account_num`, `action`, `balance`(20), `balanceN`, `cfmd_blk_num`, `blk_num`, `cfmd_tm`, `db_key`, `subnet_id`) USING BTREE",

        // account_sc
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` bigint(20) unsigned NOT NULL AUTO_INCREMENT,"
        + "`create_tm` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Contract Create Time', "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`db_key` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'DB Key', "
        + "`sc_action` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`action_target` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`from_account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Sending Account Number', "
        + "`to_account_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Receved Account Number', "
        + "`sub_id` int(11) unsigned NOT NULL DEFAULT 0,"
        + "`sc` json DEFAULT NULL,"
        + "KEY `actions1` (`action_target`, `sc_action`, `sub_id`) USING BTREE, "
        + "KEY `actions2` (`sc_action`, `sub_id`) USING BTREE, "
        + "KEY `subnet_id` (`subnet_id`) USING BTREE, "
        + "UNIQUE KEY `uk_idx` (`idx`, `subnet_id`), "
        + "PRIMARY KEY (`db_key`, `sc_action`, `action_target`, `blk_num`, `subnet_id`) USING BTREE",
    ]
}

const tableAppendix = {
    "tableName" : `myTableName`,
    "appendix" : `myAppendix`,
    "shard_exp" : `_shard`,
    "innoDB" : `ENGINE=InnoDB`,
    "spider" : `ENGINE=spider COMMENT='wrapper "mysql", table`,
    "partition" : `PARTITION BY KEY (subnet_id)`,
}

module.exports.createTables = {
    scQuerys : [
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.scQuerys[0]
        + `) ${tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.scQuerys[1]
        + `) ${tableAppendix.appendix}`,
    ],
    blockQuerys : [
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.blockQuerys[0]
        + `) ${tableAppendix.appendix}`,
    ],
    blockShardQuerys : [
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.blockShardQuerys[0]
        + `) ${tableAppendix.appendix}`,
    ],
    accountQuerys : [
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.accountQuerys[0]
        + `) ${tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.accountQuerys[1]
        + `) ${tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.accountQuerys[2]
        + `) ${tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.accountQuerys[3]
        + `) ${tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${tableAppendix.tableName} (`
        + createTableFields.accountQuerys[4]
        + `) ${tableAppendix.appendix}`,
    ]
}

module.exports.querys = {
    // sc database
    sc : {
        createSC : "CREATE DATABASE IF NOT EXISTS `sc`",
        useSC : "USE `sc`",
        // truncateScContents : `TRUNCATE sc.${createTableNames.scQuerys[0]}`,
        // truncateScDelayedTxs : `TRUNCATE sc.${createTableNames.scQuerys[1]}`,
        truncateScContents : dbUtil.truncate(`sc.${createTableNames.scQuerys[0]}`),
        truncateScDelayedTxs : dbUtil.truncate(`sc.${createTableNames.scQuerys[1]}`),
    }, 
    // block database
    block : {
        createBlock : "CREATE DATABASE IF NOT EXISTS `block`",
        useBlock : "USE `block`",
        // truncateBlkTxs : `TRUNCATE block.${createTableNames.blockQuerys[0]}`,
        // truncateBlkContents : `TRUNCATE block.${createTableNames.blockShardQuerys[0]}`,
        truncateBlkTxs : dbUtil.truncate(`block.${createTableNames.blockQuerys[0]}`),
        truncateBlkContents : dbUtil.truncate(`block.${createTableNames.blockShardQuerys[0]}`),
    }, 
    // account database
    account : {
        createAccount : "CREATE DATABASE IF NOT EXISTS `account`",
        useAccount : "USE `account`",
        // truncateAccountTokens : `TRUNCATE account.${createTableNames.accountQuerys[0]}`,
        // truncateAccountUsers : `TRUNCATE account.${createTableNames.accountQuerys[1]}`,
        // truncateAccountLedgers : `TRUNCATE account.${createTableNames.accountQuerys[2]}`,
        // truncateAccountBalance : `TRUNCATE account.${createTableNames.accountQuerys[3]}`,
        // truncateAccountSc : `TRUNCATE account.${createTableNames.accountQuerys[4]}`,
        truncateAccountTokens : dbUtil.truncate(`account.${createTableNames.accountQuerys[0]}`),
        truncateAccountUsers : dbUtil.truncate(`account.${createTableNames.accountQuerys[1]}`),
        truncateAccountLedgers : dbUtil.truncate(`account.${createTableNames.accountQuerys[2]}`),
        truncateAccountBalance : dbUtil.truncate(`account.${createTableNames.accountQuerys[3]}`),
        truncateAccountSc : dbUtil.truncate(`account.${createTableNames.accountQuerys[4]}`),
    }, 
};

module.exports.dropScDB = async () => {
    let sql = "DROP DATABASE IF EXISTS `sc`";
    await dbUtil.query(sql);
}

module.exports.dropBlockDB = async () => {
    let sql = "DROP DATABASE IF EXISTS `block`";
    await dbUtil.query(sql);
}

module.exports.dropAccountDB = async () => {
    let sql = "DROP DATABASE IF EXISTS `account`";
    await dbUtil.query(sql);
}

module.exports.truncateScDB = async () => {
    let sql;

    sql = this.querys.sc.truncateScContents;
    await dbUtil.query(sql);

    sql = this.querys.sc.truncateScDelayedTxs;
    await dbUtil.query(sql);
}

module.exports.truncateBlockDB = async () => {
    let sql;

    sql = this.querys.block.truncateBlkTxs;
    await dbUtil.query(sql);

    sql = this.querys.block.truncateBlkContents;
    await dbUtil.query(sql);
}

module.exports.truncateAccountDB = async () => {
    let sql;

    sql = this.querys.account.truncateAccountTokens;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountUsers;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountLedgers;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountBalance;
    await dbUtil.query(sql);

    sql = this.querys.account.truncateAccountSc;
    await dbUtil.query(sql);
}

// const truncate = async () => {
//     if(config.DB_TEST_MODE) {
//         await truncateScDB();
//         await truncateBlockDB();
//         await truncateAccountDB();
//     }
// }
// module.exports.truncate = truncate;

const initDatabaseSC = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        if(config.DB_TEST_MODE_DROP) {
            await this.dropScDB();
        }

        let sql = this.querys.sc.createSC;
        logger.debug("createSC : " + sql);
        await conn.query(sql);

        sql = this.querys.sc.useSC;
        await conn.query(sql);

        await util.asyncForEach(this.createTables.scQuerys, async(element, index) => {
            //logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, createTableNames.scQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("scQuerys : " + element);
            await conn.query(element);
        });

        await util.asyncForEach(procedureQuerys.scQuerys, async(element, index) => {
            await conn.query(element);
        })

        if(config.DB_TEST_MODE) {
            await this.truncateScDB();
        }
        
        ret = { res : true };
        logger.debug("Database Init - sc");
    } catch (err) {
        debug.error(err);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

const initDatabaseBlock = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        if(config.DB_TEST_MODE_DROP) {
            await this.dropBlockDB();
        }

        let sql = this.querys.block.createBlock;
        await conn.query(sql);

        sql = this.querys.block.useBlock;
        await conn.query(sql);

        await util.asyncForEach(this.createTables.blockQuerys, async(element, index) => {
            //logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, createTableNames.blockQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("blockQuerys : " + element);
            await conn.query(element);
        });

        await util.asyncForEach(this.createTables.blockShardQuerys, async(element, index) => {
            //logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, createTableNames.blockShardQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("blockShardQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateBlockDB();
        }

        ret = { res : true };
        logger.debug("Database Init - block");
    } catch (err) {
        debug.error(err);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

const initDatabaseAccount = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        if(config.DB_TEST_MODE_DROP) {
            await this.dropAccountDB();
        }

        let sql = this.querys.account.createAccount;
        await conn.query(sql);

        sql = this.querys.account.useAccount;
        await conn.query(sql);

        await util.asyncForEach(this.createTables.accountQuerys, async(element, index) => {
            //logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, createTableNames.accountQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("accountQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateAccountDB();
        }

        ret = { res : true };
        logger.debug("Database Init - account");
    } catch (err) {
        debug.error(err);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

module.exports.initDatabaseNN = async () => {
    await initDatabaseSC();
    await initDatabaseBlock();
    await initDatabaseAccount();
}