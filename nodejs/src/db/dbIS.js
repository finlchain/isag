//
const config = require('./../../config/config.js');
const define = require('./../../config/define.js');
const dbUtil = require("./../db/dbUtil.js");
const util = require('./../utils/commonUtil.js');
const logger = require('../utils/winlog.js');

//
const createDbNames = {
    "is" : "is",
}

module.exports.createTableNames = {
    isQuerys : [
        //
        "hub_info",
        "cluster_info",
        "kafka_info",
        //
        "node_hw_info",
        "node_cons_info",
        //
        "revision",
        "repl_info",
        //
        "reg_token",
        //
        "system_info",
    ]
}

const createTableFields = {
    isQuerys : [
        // hub_info
        "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`hub_code` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`name` text NOT NULL, "
        + "`latitude` text NOT NULL, "
        + "`longitude` text NOT NULL, "
        + "`country` text , "
        + "`city` text , "
        + "`hub_p2p_addr` text NOT NULL, "
        + "PRIMARY KEY (`hub_code`, `subnet_id`) USING BTREE",

        // cluster_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`sn_hash` text NOT NULL, "
        + "`cluster_p2p_addr` text NOT NULL, "
        + "PRIMARY KEY (`ip`, `subnet_id`) USING BTREE",

        // kafka_info
        "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`broker_list` text NOT NULL , "
        + "`topic_list` text, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",

        // node_hw_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`join_time` bigint(20) unsigned NOT NULL, "
        + "`sn_hash` text NOT NULL, "
        + "`ip_list` text NOT NULL, "
        + "`lan_speed_list` text NOT NULL, "
        + "`cpu` text NOT NULL, "
        + "`hdd_size` text, "
        + "`hdd_raid` text, "
        + "`ssd_size` text, "
        + "`ssd_raid` text, "
        + "`nvme_size` text, "
        + "`nvme_raid` text, "
        + "`mem_size` text NOT NULL, "
        + "`mem_speed` int(11) unsigned NOT NULL, "
        + "`lan_check` tinyint(1) unsigned NOT NULL, "
        + "`raid_check` tinyint(1) unsigned NOT NULL, "
        + "`virtual_check1` tinyint(1) unsigned NOT NULL, "
        + "`virtual_check2` tinyint(1) unsigned NOT NULL, "
        + "`total_prr` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "PRIMARY KEY (`idx`, `ip`, `subnet_id`) USING BTREE",

        // node_cons_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`ip` int(11) unsigned NOT NULL, "
        + "`p2p_addr` text, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`state` tinyint(1) NOT NULL, "
        + "`kafka_idx` smallint(5), "
        + "`hub_code` smallint(5), "
        + "`pubkey` text NOT NULL, "
        + "PRIMARY KEY (`idx`, `role`, `subnet_id`) USING BTREE",

        // revision
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`update_time` bigint(20) unsigned NOT NULL , "
        + "`rr_net` json DEFAULT NULL, "
        + "`nn_node` json DEFAULT NULL, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",

        // repl_info
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`blk_num` bigint(20) unsigned DEFAULT 0 NOT NULL COMMENT 'Block Number', "
        + "`ip` text NOT NULL, "
        + "`role` tinyint(3) unsigned NOT NULL, "
        + "`log_file` text NOT NULL, "
        + "`log_pos` text NOT NULL, "
        + "`cluster_p2p_addr` text NOT NULL, "
        // + "`repl_data` json DEFAULT NULL,"
        + "PRIMARY KEY (`idx`, `blk_num`, `role`, `subnet_id`) USING BTREE",

        // reg_token
          "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`owner_pk` text NOT NULL COMMENT 'Owner Public Key', "
        + "`super_pk` text NOT NULL COMMENT 'Super Owner Public Key', "
        + "`logo` longblob DEFAULT NULL COMMENT 'token logo', "
        + "`action` int(11) unsigned NOT NULL DEFAULT 0, "
        + "`name` text DEFAULT NULL, "
        + "`symbol` text DEFAULT NULL, "
        + "`total_supply` text DEFAULT 0 NOT NULL, "
        + "`decimal_point` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "KEY `pubkey` (`owner_pk`(64), `super_pk`(64)) USING BTREE, "
        + "KEY `symbol` (`symbol`(4)) USING BTREE, "
        + "KEY `name` (`name`(10)) USING BTREE, "
        + "PRIMARY KEY (`idx`, `action`, `subnet_id`) USING BTREE",

        // system_info
        "`subnet_id` smallint(5) unsigned DEFAULT 0 NOT NULL, "
        + "`idx` smallint(5) unsigned NOT NULL AUTO_INCREMENT, "
        + "`net_info` json DEFAULT NULL, "
        + "PRIMARY KEY (`idx`, `subnet_id`) USING BTREE",
    ]
}

module.exports.createTables = {
    isQuerys : [
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[0]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[1]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[2]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[3]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[4]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[5]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[6]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[7]
        + `) ${dbUtil.tableAppendix.appendix}`,
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.isQuerys[8]
        + `) ${dbUtil.tableAppendix.appendix}`,
    ]
}

module.exports.querys = {
    // is database
    is : {
        createIS : "CREATE DATABASE IF NOT EXISTS `is`",
        dropIS : "DROP DATABASE IF EXISTS `is`",
        useIS : "USE `is`",

        truncateIsHubInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[0]}`),
        truncateIsClusterInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[1]}`),
        truncateIsKafkaInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[2]}`),
        truncateIsNodeHwInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[3]}`),
        truncateIsNodeConsInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[4]}`),
        truncateIsRevision : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[5]}`),
        truncateIsReplInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[6]}`),
        truncateIsRegToken : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[7]}`),
        truncateIsSystemInfo : dbUtil.truncate("`is`." + `${this.createTableNames.isQuerys[8]}`),

        repl_info : {
            // selectReplInfo: "SELECT * FROM is.repl_info_shard ORDER BY blk_num DESC",
            // selectMaxReplInfoByBN: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info_shard WHERE blk_num <= ? ORDER BY blk_num DESC",
            // selectMaxReplInfoByBNAndRole: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info_shard WHERE blk_num <= ? and role = ? ORDER BY blk_num DESC",
            // selectReplInfoByBN: "SELECT * FROM is.repl_info_shard WHERE blk_num = ? ORDER BY blk_num DESC",
            // selectReplInfoByBNAndRole: "SELECT * FROM is.repl_info_shard WHERE blk_num = ? and role = ? ORDER BY blk_num DESC",
            // selectReplInfoByBNAndRoleAndClusterP2pAddr: "SELECT * FROM is.repl_info_shard WHERE blk_num = ? and role = ? and cluster_p2p_addr = ? ORDER BY blk_num DESC",
            selectReplInfo: "SELECT * FROM is.repl_info ORDER BY blk_num DESC",
            selectMaxReplInfoByBN: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info WHERE blk_num <= ? ORDER BY blk_num DESC",
            selectMaxReplInfoByBNAndRole: "SELECT MAX(blk_num) as max_blk_num FROM is.repl_info WHERE blk_num <= ? and role = ? ORDER BY blk_num DESC",
            selectReplInfoByBN: "SELECT * FROM is.repl_info WHERE blk_num = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRole: "SELECT * FROM is.repl_info WHERE blk_num = ? and role = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRoleAndClusterP2pAddr: "SELECT * FROM is.repl_info WHERE blk_num = ? and role = ? and cluster_p2p_addr = ? ORDER BY blk_num DESC",
        }, 
        reg_token : {
            //
            selectRegTokenByAction : "SELECT * FROM is.reg_token WHERE action = ?",
            selectRegTokenByName : "SELECT * FROM is.reg_token WHERE name = ?",
            selectRegTokenBySymbol : "SELECT * FROM is.reg_token WHERE symbol = ?",
        }, 
        system_info : {
            // 
        },
    }
};

const createIsDB = async () => {
    logger.info(`createIsDB`);

    await dbUtil.query(this.querys.is.createIS);
}

const dropIsDB = async () => {
    logger.info(`dropIsDB`);
    await dbUtil.query(this.querys.is.dropIS);
}

module.exports.truncateIsDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;

    sql = this.querys.is.truncateIsClusterInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsHubInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsKafkaInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeHwInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeConsInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRevision;
    await conn.query(sql);

    sql = this.querys.is.truncateIsReplInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRegToken;
    await conn.query(sql);

    sql = this.querys.is.truncateIsSystemInfo;
    await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

module.exports.truncateIsTestDB = async () => {
    const conn = await dbUtil.getConn();

    let sql;

    // sql = this.querys.is.truncateIsClusterInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsHubInfo;
    // await conn.query(sql);

    // sql = this.querys.is.truncateIsKafkaInfo;
    // await conn.query(sql);

    sql = this.querys.is.truncateIsNodeHwInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsNodeConsInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRevision;
    await conn.query(sql);

    sql = this.querys.is.truncateIsReplInfo;
    await conn.query(sql);

    sql = this.querys.is.truncateIsRegToken;
    await conn.query(sql);

    // sql = this.querys.is.truncateIsSystemInfo;
    // await conn.query(sql);

    await dbUtil.releaseConn(conn);
}

// module.exports.initDatabaseIS = async () => {
//     if(config.DB_TEST_MODE)
//     {
//         await dropIsDB();
//     }
//     await createIsDB();
// }

module.exports.initDatabaseIS = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        //
        if(config.DB_TEST_MODE_DROP) {
            logger.debug(`querys.is.dropIS : ${this.querys.is.dropIS}`);
            await conn.query(this.querys.dropIS);
        }

        //
        logger.debug(`querys.is.createIS : ${this.querys.is.createIS}`);
        await conn.query(this.querys.is.createIS);

        //
        let sql = this.querys.is.useIS;
        await conn.query(sql);

        //
        await util.asyncForEach(this.createTables.isQuerys, async(element, index) => {
            // logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, this.createTableNames.isQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("isQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateIsDB();
        }

        ret = { res : true };
        logger.info(`Database Init - ${createDbNames.is}`);
    } catch (err) {
        // debug.error(err);
        logger.error(`Database Error - ${JSON.stringify(err)}`);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

///////////////////////////////////////////////////////////////////////
// Replication Get
module.exports.getReplData = async (blkNum, role, clusterP2pAddr) => {
    logger.debug("func : getReplData");

    let query_result;

    //
    if (typeof blkNum === 'undefined')
    {
        query_result = await dbUtil.query(this.querys.is.repl_info.selectReplInfo);
    }
    else if (typeof role === 'undefined')
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(this.querys.is.repl_info.selectMaxReplInfoByBN, [blkNum]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum 1 : " + maxBlkNum);
    
            query_result = await dbUtil.queryPre(this.querys.is.repl_info.selectReplInfoByBN, [maxBlkNum]);
        }
    }
    else if (typeof clusterP2pAddr === 'undefined')
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(this.querys.is.repl_info.selectMaxReplInfoByBNAndRole, [blkNum, role]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum 2 : " + maxBlkNum);
            
            query_result = await dbUtil.queryPre(this.querys.is.repl_info.selectReplInfoByBNAndRole, [maxBlkNum, role]);
        }
    }
    else
    {
        let maxBlkNum;

        let query_result_1 = await dbUtil.queryPre(this.querys.is.repl_info.selectMaxReplInfoByBNAndRole, [blkNum, role]);
        if (query_result_1.length)
        {
            maxBlkNum = query_result_1[0].max_blk_num;
            logger.debug("maxBlkNum 3 : " + maxBlkNum);
    
            query_result = await dbUtil.queryPre(this.querys.is.repl_info.selectReplInfoByBNAndRoleAndClusterP2pAddr, [maxBlkNum, role, clusterP2pAddr]);
        }
    }
    
    //
    if (!query_result.length)
    {
        logger.error("Error - getReplData");
    }

    return query_result;
}