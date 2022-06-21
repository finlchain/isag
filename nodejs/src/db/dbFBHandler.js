//
const config = require('../../config/config.js');
const define = require('./../../config/define.js');
const util = require('./../utils/commonUtil.js');
const dbUtil = require("./../db/dbUtil.js");
const dbFB = require("./../db/dbFB.js");
const logger = require('./../utils/winlog.js');

//
module.exports.setReplInfo = async (subnet_id, blk_num, ip, role, log_file, log_pos, cluster_p2p_addr) => {
    let sql = dbFB.querys.fb.repl_info.insertReplInfo;

    let query_result = await dbUtil.queryPre(sql, [subnet_id, blk_num, ip, role, log_file, log_pos, cluster_p2p_addr]);
}
