//
const config = require('../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const logger = require('./../utils/winlog.js');

//
const createDbNames = {
    fb : "fb",
}

const createTableNames = {
    fbQuerys : [
        //
        "repl_info",
    ]
}

const createTableFields = {
    fbQuerys : [
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
    ]
}

const createTables = {
    fbQuerys : [
        `CREATE TABLE IF NOT EXISTS ${dbUtil.tableAppendix.tableName} (`
        + createTableFields.fbQuerys[0]
        + `) ${dbUtil.tableAppendix.appendix}`,
    ]
}

module.exports.querys = {
    fb : {
        // is database
        createFB : "CREATE DATABASE IF NOT EXISTS `fb`",
        dropFB : "DROP DATABASE IF EXISTS `fb`",
        useFB : "USE `fb`",

        //
        // truncateFbReplInfo : "TRUNCATE `fb`." + `${createTableNames.fbQuerys[0]}`,
        truncateFbReplInfo : dbUtil.truncate(`fb.${createTableNames.fbQuerys[0]}`),

        //
        repl_info : {
            //
            insertReplInfo: "INSERT IGNORE INTO fb.repl_info(subnet_id, blk_num, ip, role, log_file, log_pos, cluster_p2p_addr) values(?, ?, ?, ?, ?, ?, ?)",
            //
            selectReplInfo: "SELECT * FROM fb.repl_info ORDER BY blk_num DESC",
            selectReplInfoByBN: "SELECT * FROM fb.repl_info WHERE blk_num = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRole: "SELECT * FROM fb.repl_info WHERE blk_num = ? and role = ? ORDER BY blk_num DESC",
            selectReplInfoByBNAndRoleAndClusterP2pAddr: "SELECT * FROM fb.repl_info WHERE blk_num = ? and role = ? and cluster_p2p_addr = ? ORDER BY blk_num DESC",
            //
            selectMaxReplInfoByBN: "SELECT MAX(blk_num) as max_blk_num FROM fb.repl_info WHERE blk_num <= ? ORDER BY blk_num DESC",
            selectMaxReplInfoByBNAndRole: "SELECT MAX(blk_num) as max_blk_num FROM fb.repl_info WHERE blk_num <= ? and role = ? ORDER BY blk_num DESC",
        }
    },
};

//
const createFbDB = async () => {
    let sql;

    sql = this.querys.fb.createFB;
    await dbUtil.query(sql);
}

const dropFbDB = async () => {
    let sql;

    sql = this.querys.fb.dropFB;
    await dbUtil.query(sql);
}

const truncateFbAllDB = async () => {
    let sql;

    sql = this.querys.fb.truncateFbReplInfo;
    await dbUtil.query(sql);
}

module.exports.truncateFbDB = async () => {
    let sql;

    sql = this.querys.fb.truncateFbReplInfo;
    await dbUtil.query(sql);
}

module.exports.initDatabaseFB = async () => {
    let ret;
    const conn = await dbUtil.getConn();

    try {
        //
        if(config.DB_TEST_MODE_DROP) {
            // logger.debug(`querys.fb.dropFB : ${this.querys.fb.dropFB}`);
            await conn.query(this.querys.fb.dropFB);
        }

        //
        // logger.debug(`querys.fb.createFB : ${this.querys.fb.createFB}`);
        await conn.query(this.querys.fb.createFB);

        //
        let sql = this.querys.fb.useFB;
        await conn.query(sql);

        //
        await util.asyncForEach(createTables.fbQuerys, async(element, index) => {
            // logger.debug("element : " + element);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.tableName}`, createTableNames.fbQuerys[index]);
            element = util.stringReplace(element, `${dbUtil.tableAppendix.appendix}`, dbUtil.tableAppendix.innoDB);
            // logger.debug("fbQuerys : " + element);
            await conn.query(element);
        });

        if(config.DB_TEST_MODE) {
            await this.truncateIsTestDB();
        }

        ret = { res : true };
        logger.debug(`Database Init - ${createDbNames.fb}`);
    } catch (err) {
        // debug.error(err);
        logger.error(`Database Error - ${JSON.stringify(err)}`);
        ret = { res : false, reason : JSON.stringify(err)};
    }

    await dbUtil.releaseConn(conn);

    return ret;
}

